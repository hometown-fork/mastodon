# frozen_string_literal: true

class Api::V1::EmojiReactionsController < Api::BaseController
  before_action -> { doorkeeper_authorize! :read, :'read:favourites' }
  before_action :require_user!
  after_action :insert_pagination_headers

  def index
    @statuses  = load_statuses
    accountIds = @statuses.filter(&:quote?).map { |status| status.quote.account_id }.uniq
    render json: @statuses, each_serializer: REST::StatusSerializer, relationships: StatusRelationshipsPresenter.new(@statuses, current_user&.account_id), account_relationships: AccountRelationshipsPresenter.new(accountIds, current_user&.account_id)
  end

  private

  def load_statuses
    cached_emoji_reactions
  end

  def cached_emoji_reactions
    cache_collection(Status.include_expired.where(id: results.pluck(:status_id)), Status)
  end

  def results
    @_results ||= filtered_emoji_reactions.joins('INNER JOIN statuses ON statuses.deleted_at IS NULL AND statuses.id = emoji_reactions.status_id').to_a_paginated_by_id(
      limit_param(DEFAULT_STATUSES_LIMIT),
      params_slice(:max_id, :since_id, :min_id)
    )
  end

  def filtered_emoji_reactions
    account_emoji_reactions.tap do |emoji_reactions|
      emoji_reactions.merge!(emojis_scope) if emojis_requested?
    end
  end

  def account_emoji_reactions
    current_account.emoji_reactions
  end

  def insert_pagination_headers
    set_pagination_headers(next_path, prev_path)
  end

  def next_path
    api_v1_emoji_reactions_url pagination_params(max_id: pagination_max_id) if records_continue?
  end

  def prev_path
    api_v1_emoji_reactions_url pagination_params(min_id: pagination_since_id) unless results.empty?
  end

  def pagination_max_id
    results.last.id
  end

  def pagination_since_id
    results.first.id
  end

  def records_continue?
    results.size == limit_param(DEFAULT_STATUSES_LIMIT)
  end

  def emojis_requested?
    emoji_reactions_params[:emojis].present?
  end

  def emojis_scope
    emoji_reactions = EmojiReaction.none

    emoji_reactions_params[:emojis].each do |emoji|
      shortcode, domain = emoji.split("@")
      custom_emoji = CustomEmoji.find_by(shortcode: shortcode, domain: domain)

      emoji_reactions = emoji_reactions.or(EmojiReaction.where(name: shortcode, custom_emoji: custom_emoji))
    end

    emoji_reactions
  end

  def pagination_params(core_params)
    params.slice(:limit).permit(:limit).merge(core_params)
  end

  def emoji_reactions_params
    params.permit(emojis: [])
  end
end
