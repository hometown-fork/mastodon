# frozen_string_literal: true

class BatchedRemoveStatusService < BaseService
  include Redisable

  # Delete multiple statuses and reblogs of them as efficiently as possible
  # @param [Enumerable<Status>] statuses An array of statuses
  # @param [Hash] options
  # @option [Boolean] :skip_side_effects Do not modify feeds and send updates to streaming API
  def call(statuses, **options)
    ActiveRecord::Associations::Preloader.new.preload(statuses, options[:skip_side_effects] ? :reblogs : [:account, :tags, reblogs: :account])

    statuses_and_reblogs = statuses.flat_map { |status| [status] + status.reblogs }

    # The conversations for direct visibility statuses also need
    # to be manually updated. This part is not efficient but we
    # rely on direct visibility statuses being relatively rare.
    statuses_with_account_conversations = statuses.select(&:direct_visibility?)

    ActiveRecord::Associations::Preloader.new.preload(statuses_with_account_conversations, [mentions: :account])

    statuses_with_account_conversations.each do |status|
      status.send(:unlink_from_conversations)
    end

    status_ids_with_capability_tokens = statuses.local.joins(:capability_tokens).where.not(capability_tokens: { id: nil }).pluck(:id)
    status_ids_with_capability_tokens += Status.where(reblog_of_id: statuses).local.joins(:capability_tokens).where.not(capability_tokens: { id: nil }).pluck(:id)
    status_ids_with_capability_tokens.each_slice(50) { |slice| StatusCapabilityToken.where(status_id: slice).delete_all }

    # We do not batch all deletes into one to avoid having a long-running
    # transaction lock the database, but we use the delete method instead
    # of destroy to avoid all callbacks. We rely on foreign keys to
    # cascade the delete faster without loading the associations.
    statuses_and_reblogs.each_slice(50) { |slice| Status.where(id: slice.map(&:id)).delete_all }

    # Since we skipped all callbacks, we also need to manually
    # deindex the statuses
    Chewy.strategy.current.update(StatusesIndex, statuses_and_reblogs) if Chewy.enabled?

    return if options[:skip_side_effects]

    # Batch by source account
    statuses_and_reblogs.group_by(&:account_id).each_value do |account_statuses|
      account = account_statuses.first.account

      next unless account

      unpush_from_home_timelines(account, account_statuses)
      unpush_from_list_timelines(account, account_statuses)
    end

    # Cannot be batched
    @status_id_cutoff = Mastodon::Snowflake.id_at(2.weeks.ago)
    redis.pipelined do
      statuses.each do |status|
        unpush_from_group_timelines(status)
        unpush_from_public_timelines(status)
      end
    end
  end

  private

  def unpush_from_home_timelines(account, statuses)
    Account.where(id: Account
      .union(account.followers_for_local_distribution.reorder(nil).select(:id))
      .union(account.subscribers_for_local_distribution.reorder(nil).select('account_subscribes.account_id as id'))
    ).includes(:user).find_each do |follower_and_subscriber|
      statuses.each do |status|
        FeedManager.instance.unpush_from_home(follower_and_subscriber, status)
      end
    end
  end

  def unpush_from_list_timelines(account, statuses)
    List.where(id: List
      .union(account.lists_for_local_distribution.reorder(nil).select(:id))
      .union(account.list_subscribers_for_local_distribution.reorder(nil).select('list_id as id'))
    ).includes(account: :user).find_each do |list|
      statuses.each do |status|
        FeedManager.instance.unpush_from_list(list, status)
      end
    end
  end

  def unpush_from_group_timelines(status)
    return unless status.account.group?

    payload = Oj.dump(event: :delete, payload: status.reblog? ? status.reblog.id.to_s : status.id.to_s)

    redis.publish("timeline:group:#{status.account.id}", payload)

    @tags[status.id].each do |hashtag|
      redis.publish("timeline:group:#{status.account.id}:#{hashtag.mb_chars.downcase}", payload)
    end

    if status.media_attachments.any?
      redis.publish("timeline:group:media:#{status.account.id}", payload)

      @tags[status.id].each do |hashtag|
        redis.publish("timeline:group:media:#{status.account.id}:#{hashtag.mb_chars.downcase}", payload)
      end
    end
  end

  def unpush_from_public_timelines(status)
    return unless status.public_visibility? && status.id > @status_id_cutoff

    payload = Oj.dump(event: :delete, payload: status.id.to_s)
    domain  = status.account.domain&.mb_chars&.downcase

    redis.pipelined do
      redis.publish('timeline:public', payload)
      if status.local?
        redis.publish('timeline:public:local', payload)
      else
        redis.publish('timeline:public:remote', payload)
        redis.publish("timeline:public:domain:#{domain}", payload) unless domain.nil?
      end

      if status.media_attachments.any?
        redis.publish('timeline:public:media', payload)
        if status.local?
          redis.publish('timeline:public:local:media', payload)
        else
          redis.publish('timeline:public:remote:media', payload)
          redis.publish("timeline:public:domain:media:#{domain}", payload) unless domain.nil?
        end
      end

      status.tags.map { |tag| tag.name.mb_chars.downcase }.each do |hashtag|
        redis.publish("timeline:hashtag:#{hashtag}", payload)
        redis.publish("timeline:hashtag:#{hashtag}:local", payload) if status.local?
      end
    end
  end
end
