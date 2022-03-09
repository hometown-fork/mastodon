
# frozen_string_literal: true

class Api::V1::KeywordSubscribesController < Api::BaseController
  before_action -> { doorkeeper_authorize! :read, :'read:follows' }, only: [:index, :show]
  before_action -> { doorkeeper_authorize! :write, :'write:follows' }, except: [:index, :show]
  before_action :require_user!
  before_action :set_keyword_subscribes, only: :index
  before_action :set_keyword_subscribe, only: [:show, :update, :destroy]

  respond_to :json

  def index
    render json: @keyword_subscribes, each_serializer: REST::KeywordSubscribesSerializer
  end

  def create
    @keyword_subscribe = current_account.keyword_subscribes.create!(resource_params)
    render json: @keyword_subscribe, serializer: REST::KeywordSubscribesSerializer
  end

  def show
    render json: @keyword_subscribe, serializer: REST::KeywordSubscribesSerializer
  end

  def update
    @keyword_subscribe.update!(resource_params)
    render json: @keyword_subscribe, serializer: REST::KeywordSubscribesSerializer
  end

  def destroy
    @keyword_subscribe.destroy!
    render_empty
  end

  private

  def set_keyword_subscribes
    @keyword_subscribes = current_account.keyword_subscribes
  end

  def set_keyword_subscribe
    @keyword_subscribe = current_account.keyword_subscribes.find(params[:id])
  end

  def resource_params
    params.permit(:name, :keyword, :exclude_keyword, :ignorecase, :regexp, :ignore_block, :media_only, :disabled, :list_id)
  end
end
