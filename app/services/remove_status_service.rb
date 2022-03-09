# frozen_string_literal: true

class RemoveStatusService < BaseService
  include Redisable
  include Payloadable

  # Delete a status
  # @param   [Status] status
  # @param   [Hash] options
  # @option  [Boolean] :redraft
  # @option  [Boolean] :immediate
  # @option  [Boolean] :original_removed
  # @option  [Boolean] :mark_expired
  def call(status, **options)
    @status        = status
    @account       = status.account
    @options       = options
    @status_expire = status.status_expire
    @payload       = Oj.dump(event: mark_expired? ? :expire : :delete, payload: status.id.to_s)

    return if mark_expired? && @status_expire.nil?

    @status.discard unless mark_expired?

    RedisLock.acquire(lock_options) do |lock|
      if lock.acquired?
        remove_from_self if @account.local?
        remove_from_followers
        remove_from_lists
        remove_from_subscribers
        remove_from_subscribers_lists

        # There is no reason to send out Undo activities when the
        # cause is that the original object has been removed, since
        # original object being removed implicitly removes reblogs
        # of it. The Delete activity of the original is forwarded
        # separately.
        remove_from_remote_reach if @account.local? && !@options[:original_removed]

        # Since reblogs don't mention anyone, don't get reblogged,
        # favourited and don't contain their own media attachments
        # or hashtags, this can be skipped
        unless @status.reblog?
          remove_from_mentions
          remove_reblogs
          remove_from_hashtags
          remove_from_group if status.account.group?
          remove_from_public
          remove_from_media if @status.media_attachments.any?
          remove_media unless mark_expired?
        end

        if mark_expired?
          UnpinService.new.call(@account, @status)
          @status.update!(expired_at: @status_expire.expires_at)
          @status_expire.destroy
        else
          @status_expire&.destroy
          @status.destroy! if @options[:immediate] || !@status.reported?
        end
      else
        raise Mastodon::RaceConditionError
      end
    end
  end

  private

  def mark_expired?
    @options[:mark_expired]
  end

  def remove_from_self
    FeedManager.instance.unpush_from_home(@account, @status, **@options)
  end

  def remove_from_followers
    @account.followers_for_local_distribution.includes(:user).reorder(nil).find_each do |follower|
      FeedManager.instance.unpush_from_home(follower, @status, **@options)
    end
  end

  def remove_from_lists
    @account.lists_for_local_distribution.select(:id, :account_id).includes(account: :user).reorder(nil).find_each do |list|
      FeedManager.instance.unpush_from_list(list, @status, **@options)
    end
  end

  def remove_from_subscribers
    @account.subscribers_for_local_distribution.with_reblog(@status.reblog?).with_media(@status.proper).includes(account: :user).reorder(nil).find_each do |subscribing|
      FeedManager.instance.unpush_from_home(subscribing.account, @status, **@options)
    end
  end

  def remove_from_subscribers_lists
    @account.list_subscribers_for_local_distribution.with_reblog(@status.reblog?).with_media(@status.proper).includes(account: :user).reorder(nil).find_each do |subscribing|
      FeedManager.instance.unpush_from_list(subscribing.list, @status, **@options)
    end
  end

  def remove_from_mentions
    # For limited visibility statuses, the mentions that determine
    # who receives them in their home feed are a subset of followers
    # and therefore the delete is already handled by sending it to all
    # followers. Here we send a delete to actively mentioned accounts
    # that may not follow the account

    @status.active_mentions.find_each do |mention|
      redis.publish("timeline:#{mention.account_id}", @payload)
    end
  end

  def remove_from_remote_reach
    # Followers, relays, people who got mentioned in the status,
    # or who reblogged it from someone else might not follow
    # the author and wouldn't normally receive the delete
    # notification - so here, we explicitly send it to them

    status_reach_finder = StatusReachFinder.new(@status)

    ActivityPub::DeliveryWorker.push_bulk(status_reach_finder.inboxes) do |inbox_url|
      [signed_activity_json, @account.id, inbox_url]
    end
  end

  def signed_activity_json
    @signed_activity_json ||= Oj.dump(serialize_payload(@status, @status.reblog? ? ActivityPub::UndoAnnounceSerializer : ActivityPub::DeleteSerializer, signer: @account, expiry: mark_expired? ? @status.expiry : nil))
  end

  def remove_reblogs
    # We delete reblogs of the status before the original status,
    # because once original status is gone, reblogs will disappear
    # without us being able to do all the fancy stuff

    @status.reblogs.includes(:account).reorder(nil).find_each do |reblog|
      RemoveStatusService.new.call(reblog, original_removed: true)
    end
  end

  def remove_from_hashtags
    @account.featured_tags.where(tag_id: @status.tags.map(&:id)).each do |featured_tag|
      featured_tag.decrement(@status.id)
    end

    return unless @status.public_visibility?

    @status.tags.map(&:name).each do |hashtag|
      redis.publish("timeline:hashtag:#{hashtag.mb_chars.downcase}", @payload)
      redis.publish("timeline:hashtag:#{hashtag.mb_chars.downcase}:local", @payload) if @status.local?
    end
  end

  def remove_from_group
    payload = @status.reblog? ? Oj.dump(event: :delete, payload: @status.reblog.id.to_s) : @payload

    redis.publish("timeline:group:#{@status.account.id}", payload)

    @status.tags.map(&:name).each do |hashtag|
      redis.publish("timeline:group:#{@status.account.id}:#{hashtag.mb_chars.downcase}", payload)
    end

    if @status.media_attachments.any?
      redis.publish("timeline:group:media:#{@status.account.id}", payload)

      @status.tags.map(&:name).each do |hashtag|
        redis.publish("timeline:group:media:#{@status.account.id}:#{hashtag.mb_chars.downcase}", payload)
      end
    end
  end

  def remove_from_public
    return unless @status.public_visibility?

    redis.publish('timeline:public', @payload)
    if @status.local?
      redis.publish('timeline:public:local', @payload)
    else
      redis.publish('timeline:public:remote', @payload)
      redis.publish("timeline:public:domain:#{@account.domain.mb_chars.downcase}", @payload)
    end
  end

  def remove_from_media
    return unless @status.public_visibility?

    redis.publish('timeline:public:media', @payload)
    if @status.local?
      redis.publish('timeline:public:local:media', @payload)
    else
      redis.publish('timeline:public:remote:media', @payload)
      redis.publish("timeline:public:domain:media:#{@account.domain.mb_chars.downcase}", @payload)
    end
  end

  def remove_media
    return if @options[:redraft] || (!@options[:immediate] && @status.reported?)

    @status.media_attachments.destroy_all
  end

  def lock_options
    { redis: Redis.current, key: "distribute:#{@status.id}", autorelease: 5.minutes.seconds }
  end
end
