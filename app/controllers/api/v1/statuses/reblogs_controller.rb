# frozen_string_literal: true

class Api::V1::Statuses::ReblogsController < Api::BaseController
  include Authorization

  before_action -> { doorkeeper_authorize! :write, :'write:statuses' }
  before_action :require_user!
  before_action :set_reblog, only: [:create]
  before_action :set_circle, only: [:create]

  override_rate_limit_headers :create, family: :statuses

  def create
    @status = ReblogService.new.call(current_account, @reblog, reblog_params)

    render json: @status, serializer: REST::StatusSerializer
  end

  def destroy
    @status = current_account.statuses.find_by(reblog_of_id: params[:status_id])

    if @status
      authorize @status, :unreblog?
      @status.discard
      RemovalWorker.perform_async(@status.id)
      @reblog = @status.reblog
    else
      @reblog = Status.find(params[:status_id])
      authorize @reblog, :show?
    end

    render json: @reblog, serializer: REST::StatusSerializer, relationships: StatusRelationshipsPresenter.new([@status], current_account.id, reblogs_map: { @reblog.id => false })
  rescue Mastodon::NotPermittedError
    not_found
  end

  private

  def set_reblog
    @reblog = Status.find(params[:status_id])
    authorize @reblog, :show?
  rescue Mastodon::NotPermittedError
    not_found
  end

  def set_circle
    reblog_params[:circle] = begin
      if reblog_params[:visibility] == 'mutual'
        reblog_params[:visibility] = 'limited'
        current_account
      elsif reblog_params[:circle_id].blank?
        nil
      else
        current_account.owned_circles.find(reblog_params[:circle_id])
      end
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: I18n.t('statuses.errors.circle_not_found') }, status: 404
  end

  def reblog_params
    params.permit(:visibility, :circle_id)
  end
end
