# frozen_string_literal: true

class Settings::FollowTagsController < Settings::BaseController
  layout 'admin'

  before_action :authenticate_user!
  before_action :set_lists, only: [:index, :new, :edit, :update]
  before_action :set_follow_tags, only: :index
  before_action :set_follow_tag, only: [:edit, :update, :destroy]

  def index
    @follow_tag = FollowTag.new
  end

  def new
    @follow_tag = current_account.follow_tags.build
  end

  def create
    @follow_tag = current_account.follow_tags.new(follow_tag_params)

    if @follow_tag.save
      redirect_to settings_follow_tags_path
    else
      set_follow_tags

      render :index
    end
  end

  def edit; end

  def update
    if @follow_tag.update(follow_tag_params)
      redirect_to settings_follow_tags_path
    else
      render action: :edit
    end
  end

  def destroy
    @follow_tag.destroy!
    redirect_to settings_follow_tags_path
  end

  private

  def set_follow_tag
    @follow_tag = current_account.follow_tags.find(params[:id])
  end

  def set_follow_tags
    @follow_tags = current_account.follow_tags.order('list_id NULLS FIRST', :updated_at).page(params[:page]).per(40)
  end

  def set_lists
    @lists = List.where(account: current_account).all
  end

  def follow_tag_params
    new_params = resource_params.permit!.to_h

    if resource_params[:list_id] == '-1'
      list = List.find_or_create_by!({ account: current_account, title: new_params[:name] })
      new_params.merge!({list_id: list.id})
    end

    new_params
  end

  def resource_params
    params.require(:follow_tag).permit(:name, :list_id, :media_only)
  end
end
