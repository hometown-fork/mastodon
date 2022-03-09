# frozen_string_literal: true

class Settings::FavouriteTagsController < Settings::BaseController
  layout 'admin'

  before_action :authenticate_user!
  before_action :set_favourite_tags, only: :index
  before_action :set_favourite_tag, except: [:index, :create]

  def index
    @favourite_tag = FavouriteTag.new
  end

  def create
    @favourite_tag = current_account.favourite_tags.new(favourite_tag_params)

    if @favourite_tag.save
      redirect_to settings_favourite_tags_path
    else
      set_favourite_tags

      render :index
    end
  end

  def destroy
    @favourite_tag.destroy!
    redirect_to settings_favourite_tags_path
  end

  private

  def set_favourite_tag
    @favourite_tag = current_account.favourite_tags.find(params[:id])
  end

  def set_favourite_tags
    @favourite_tags = current_account.favourite_tags.order(:updated_at).reject(&:new_record?)
  end

  def favourite_tag_params
    params.require(:favourite_tag).permit(:name)
  end
end
