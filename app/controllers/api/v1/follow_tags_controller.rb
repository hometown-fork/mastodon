# frozen_string_literal: true

class Api::V1::FollowTagsController < Api::BaseController
  before_action -> { doorkeeper_authorize! :read, :'read:follows' }, only: [:index, :show]
  before_action -> { doorkeeper_authorize! :write, :'write:follows' }, except: [:index, :show]

  before_action :require_user!
  before_action :set_follow_tag, except: [:index, :create]

  def index
    @follow_tags = FollowTag.where(account: current_account).all
    render json: @follow_tags, each_serializer: REST::FollowTagSerializer
  end

  def show
    render json: @follow_tag, serializer: REST::FollowTagSerializer
  end

  def create
    @follow_tag = FollowTag.create!(follow_tag_params.merge(account: current_account))
    render json: @follow_tag, serializer: REST::FollowTagSerializer
  end

  def update
    @follow_tag.update!(follow_tag_params)
    render json: @follow_tag, serializer: REST::FollowTagSerializer
  end

  def destroy
    @follow_tag.destroy!
    render_empty
  end

  private

  def set_follow_tag
    @follow_tag = FollowTag.where(account: current_account).find(params[:id])
  end

  def follow_tag_params
    params.permit(:name, :media_only)
  end
end
