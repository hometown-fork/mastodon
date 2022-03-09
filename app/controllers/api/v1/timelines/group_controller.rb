# frozen_string_literal: true

class Api::V1::Timelines::GroupController < Api::BaseController
  before_action :load_group
  after_action :insert_pagination_headers, unless: -> { @statuses.empty? }

  def show
    @statuses = load_statuses
    render json: @statuses, each_serializer: REST::StatusSerializer, relationships: StatusRelationshipsPresenter.new(@statuses, current_user&.account_id)
  end

  private

  def load_group
    @group = Account.groups.find(params[:id])
  end

  def load_statuses
    cached_group_statuses
  end

  def cached_group_statuses
    cache_collection group_statuses, Status
  end

  def group_statuses
    if @group.nil?
      []
    else
      statuses = group_timeline_statuses.to_a_paginated_by_id(
        limit_param(DEFAULT_STATUSES_LIMIT),
        params_slice(:max_id, :since_id, :min_id)
      )
      statuses.merge!(no_replies_scope) if truthy_param?(:exclude_replies)
      statuses.merge!(hashtag_scope)    if params[:tagged].present?

      if truthy_param?(:only_media)
        # `SELECT DISTINCT id, updated_at` is too slow, so pluck ids at first, and then select id, updated_at with ids.
        status_ids = statuses.joins(:media_attachments).distinct(:id).pluck(:id)
        statuses.where(id: status_ids)
      else
        statuses
      end
    end
  end

  def group_timeline_statuses
    @group.permitted_group_statuses(current_account)
  end

  def no_replies_scope
    Status.without_replies
  end

  def hashtag_scope
    tag = Tag.find_normalized(params[:tagged])

    if tag
      Status.tagged_with(tag.id)
    else
      Status.none
    end
  end

  def insert_pagination_headers
    set_pagination_headers(next_path, prev_path)
  end

  def pagination_params(core_params)
    params.slice(:limit, :only_media, :exclude_replies).permit(:limit, :only_media, :exclude_replies).merge(core_params)
  end

  def next_path
    api_v1_timelines_group_url params[:id], pagination_params(max_id: pagination_max_id)
  end

  def prev_path
    api_v1_timelines_group_url params[:id], pagination_params(min_id: pagination_since_id)
  end

  def pagination_max_id
    @statuses.last.id
  end

  def pagination_since_id
    @statuses.first.id
  end
end
