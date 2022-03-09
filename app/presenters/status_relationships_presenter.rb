# frozen_string_literal: true

class StatusRelationshipsPresenter
  attr_reader :reblogs_map, :favourites_map, :mutes_map, :pins_map,
              :bookmarks_map, :emoji_reactions_map

  def initialize(statuses, current_account_id = nil, **options)
    if current_account_id.nil?
      @reblogs_map         = {}
      @favourites_map      = {}
      @bookmarks_map       = {}
      @emoji_reactions_map = {}
      @mutes_map           = {}
      @pins_map            = {}
    else
      statuses            = Status.where(id: statuses) if statuses.first.is_a?(Integer)
      statuses            = statuses.compact
      status_ids          = statuses.flat_map { |s| [s.id, s.reblog_of_id] }.uniq.compact
      conversation_ids    = statuses.filter_map(&:conversation_id).uniq
      pinnable_status_ids = statuses.map(&:proper).filter_map { |s| s.id if s.account_id == current_account_id && %w(public unlisted).include?(s.visibility) }

      result = ActiveRecord::Base.connection.select_all(ActiveRecord::Base.sanitize_sql_array([<<-SQL.squish, account_id: current_account_id, status_ids: status_ids, conversation_ids: conversation_ids, pinnable_status_ids: pinnable_status_ids])).to_a.first
        select
          (select string_agg(reblog_of_id::text, ',') from statuses where account_id = :account_id and reblog_of_id in (:status_ids)) as reblogs,
          (select string_agg(status_id::text, ',') from favourites where account_id = :account_id and status_id IN (:status_ids)) as favourites,
          (select string_agg(status_id::text, ',') from bookmarks where account_id = :account_id and status_id in (:status_ids)) as bookmarks,
          (select string_agg(status_id::text, ',') from emoji_reactions where account_id = :account_id and status_id in (:status_ids)) as emoji_reactions,
          (select string_agg(conversation_id::text, ',') from conversation_mutes where account_id = :account_id and conversation_id in (:conversation_ids)) as mutes,
          (select string_agg(status_id::text, ',') from status_pins where account_id = :account_id and status_id in (:pinnable_status_ids)) as pins
        SQL

      @reblogs_map         = mapping(result['reblogs'],         options[:reblogs_map])
      @favourites_map      = mapping(result['favourites'],      options[:favourites_map])
      @bookmarks_map       = mapping(result['bookmarks'],       options[:bookmarks_map])
      @emoji_reactions_map = mapping(result['emoji_reactions'], options[:emoji_reactions_map])
      @mutes_map           = mapping(result['mutes'],           options[:mutes_map])
      @pins_map            = mapping(result['pins'],            options[:pins_map])
    end
  end

  private

  def mapping(result, additional)
    (result&.split(',')&.map(&:to_i)&.index_with(true) || {}).merge(additional || {})
  end
end
