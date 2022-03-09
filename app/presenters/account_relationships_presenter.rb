# frozen_string_literal: true

class AccountRelationshipsPresenter
  attr_reader :following, :showing_reblogs, :notifying, :delivery_following, :followed_by, :subscribing, :blocking, :blocked_by,
              :muting, :muting_notifications, :requested, :domain_blocking,
              :endorsed, :account_note

  def initialize(account_ids, current_account_id, **options)
    @account_ids        = account_ids.map { |a| a.is_a?(Account) ? a.id : a.to_i }.uniq
    @current_account_id = current_account_id.is_a?(Account) ? current_account_id.id : current_account_id.to_i

    @following            = cached[:following]
    @showing_reblogs      = cached[:showing_reblogs]
    @notifying            = cached[:notifying]
    @delivery_following   = cached[:delivery_following]
    @followed_by          = cached[:followed_by]
    @subscribing          = cached[:subscribing]
    @blocking             = cached[:blocking]
    @blocked_by           = cached[:blocked_by]
    @muting               = cached[:muting]
    @muting_notifications = cached[:muting_notifications]
    @requested            = cached[:requested]
    @domain_blocking      = cached[:domain_blocking]
    @endorsed             = cached[:endorsed]
    @account_note         = cached[:account_note]

    if current_account_id.present? && !account_ids.empty?
      result = ActiveRecord::Base.connection.select_all(ActiveRecord::Base.sanitize_sql_array([<<-SQL.squish, account_ids: @uncached_account_ids, current_account_id: @current_account_id])).to_a.first
      with
        followings as (select * from follows where account_id = :current_account_id and target_account_id in (:account_ids)),
        follow_requesteds as (select * from follow_requests where account_id = :current_account_id and target_account_id in (:account_ids)),
        filter_mutes as (select * from mutes where account_id = :current_account_id and target_account_id in (:account_ids)),
        subscribe_lists as (select target_account_id, coalesce(list_id, -1) as id, json_object_agg('reblogs', show_reblogs) as reblogs from account_subscribes where account_id = :current_account_id and target_account_id in (:account_ids) group by target_account_id, id)
      select
        (select string_agg(target_account_id::text, ',') from followings) as following,
        (select string_agg(target_account_id::text, ',') from (select target_account_id from followings where show_reblogs union all select target_account_id from follow_requesteds where show_reblogs) a) as showing_reblogs,
        (select string_agg(target_account_id::text, ',') from (select target_account_id from followings where notify union all select target_account_id from follow_requesteds where notify) a) as notifying,
        (select string_agg(target_account_id::text, ',') from (select target_account_id from followings where delivery union all select target_account_id from follow_requesteds where delivery) a) as delivery_following,
        (select string_agg(target_account_id::text, ',') from follow_requesteds) as requested,
        (select string_agg(account_id::text, ',') from follows where target_account_id = :current_account_id and account_id in (:account_ids)) as followed_by,
        (select json_object_agg(list.target_account_id, list.val)
          from (select target_account_id, json_object_agg(lists.id, lists.reblogs) as val from subscribe_lists as lists group by target_account_id) as list) as subscribing,
        (select string_agg(target_account_id::text, ',') from blocks where account_id = :current_account_id and target_account_id in (:account_ids)) as blocking,
        (select string_agg(account_id::text, ',') from blocks where target_account_id = :current_account_id and account_id in (:account_ids)) as blocked_by,
        (select string_agg(target_account_id::text, ',') from filter_mutes) as muting,
        (select string_agg(target_account_id::text, ',') from filter_mutes where hide_notifications) as muting_notifications,
        (select string_agg(a.id::text, ',') from accounts a join account_domain_blocks adb on a.domain = adb.domain where adb.account_id = :current_account_id and a.id in (:account_ids)) as domain_blocking,
        (select string_agg(target_account_id::text, ',') from account_pins where account_id = :current_account_id and target_account_id in (:account_ids)) as endorsed,
        (select json_object_agg(n.target_account_id, n.val)
          from (select target_account_id, json_object_agg('comment', comment) as val from account_notes where account_id = :current_account_id and target_account_id in (:account_ids) group by target_account_id) as n) as account_note
      SQL

      @following.merge!(mapping_from_string(result['following']))
      @showing_reblogs.merge!(mapping_from_string(result['showing_reblogs']))
      @notifying.merge!(mapping_from_string(result['notifying']))
      @delivery_following.merge!(mapping_from_string(result['delivery_following']))
      @followed_by.merge!(mapping_from_string(result['followed_by']))
      @subscribing.merge!(mapping_from_json(result['subscribing']))
      @blocking.merge!(mapping_from_string(result['blocking']))
      @blocked_by.merge!(mapping_from_string(result['blocked_by']))
      @muting.merge!(mapping_from_string(result['muting']))
      @muting_notifications.merge!(mapping_from_string(result['muting_notifications']))
      @requested.merge!(mapping_from_string(result['requested']))
      @domain_blocking.merge!(mapping_from_string(result['domain_blocking']))
      @endorsed.merge!(mapping_from_string(result['endorsed']))
      @account_note.merge!(mapping_from_json(result['account_note']))

      cache_uncached!
    end

    @following.merge!(options[:following_map] || {})
    @showing_reblogs.merge!(options[:showing_reblogs_map] || {})
    @notifying.merge!(options[:notifying_map] || {})
    @delivery_following.merge!(options[:delivery_following_map] || {})
    @followed_by.merge!(options[:followed_by_map] || {})
    @subscribing.merge!(options[:subscribing_map] || {})
    @blocking.merge!(options[:blocking_map] || {})
    @blocked_by.merge!(options[:blocked_by_map] || {})
    @muting.merge!(options[:muting_map] || {})
    @muting_notifications.merge!(options[:muting_notifications_map] || {})
    @requested.merge!(options[:requested_map] || {})
    @domain_blocking.merge!(options[:domain_blocking_map] || {})
    @endorsed.merge!(options[:endorsed_map] || {})
    @account_note.merge!(options[:account_note_map] || {})
  end

  private

  def mapping_from_string(string)
    return {} if string.blank?

    string&.split(',')&.map(&:to_i)&.index_with(true) || {}
  end

  def mapping_from_json(json)
    return {} if json.blank?

    (Oj.load(json, mode: :strict, symbol_keys: true) || {}).tap do |json_data|
      json_data.keys.each do |key|
        json_data[(Integer(key.to_s) rescue key) || key] = json_data.delete(key)
      end
    end
  end

  def cached
    return @cached if defined?(@cached)

    @cached = {
      following: {},
      showing_reblogs: {},
      notifying: {},
      delivery_following: {},
      followed_by: {},
      subscribing: {},
      blocking: {},
      blocked_by: {},
      muting: {},
      muting_notifications: {},
      requested: {},
      domain_blocking: {},
      endorsed: {},
      account_note: {},
    }

    @uncached_account_ids = []

    @account_ids.each do |account_id|
      maps_for_account = Rails.cache.read("relationship:#{@current_account_id}:#{account_id}")

      if maps_for_account.is_a?(Hash)
        @cached.deep_merge!(maps_for_account)
      else
        @uncached_account_ids << account_id
      end
    end

    @cached
  end

  def cache_uncached!
    @uncached_account_ids.each do |account_id|
      maps_for_account = {
        following:            { account_id => following[account_id] },
        showing_reblogs:      { account_id => showing_reblogs[account_id] },
        notifying:            { account_id => notifying[account_id] },
        delivery_following:   { account_id => delivery_following[account_id] },
        followed_by:          { account_id => followed_by[account_id] },
        subscribing:          { account_id => subscribing[account_id] },
        blocking:             { account_id => blocking[account_id] },
        blocked_by:           { account_id => blocked_by[account_id] },
        muting:               { account_id => muting[account_id] },
        muting_notifications: { account_id => muting_notifications[account_id] },
        requested:            { account_id => requested[account_id] },
        domain_blocking:      { account_id => domain_blocking[account_id] },
        endorsed:             { account_id => endorsed[account_id] },
        account_note:         { account_id => account_note[account_id] },
      }

      Rails.cache.write("relationship:#{@current_account_id}:#{account_id}", maps_for_account, expires_in: 1.day)
    end
  end
end
