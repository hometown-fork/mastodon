# frozen_string_literal: true

class Settings::KeywordSubscribesController < ApplicationController
  include Authorization

  layout 'admin'

  before_action :set_lists, only: [:index, :new, :edit, :update]
  before_action :set_keyword_subscribes, only: :index
  before_action :set_keyword_subscribe, only: [:edit, :update, :destroy]
  before_action :set_body_classes

  def index
    @keyword_subscribe = KeywordSubscribe.new
  end

  def new
    @keyword_subscribe = current_account.keyword_subscribes.build
  end

  def create
    @keyword_subscribe = current_account.keyword_subscribes.build(keyword_subscribe_params)

    if @keyword_subscribe.save
      redirect_to settings_keyword_subscribes_path
    else
      render action: :new
    end
  end

  def edit; end

  def update
    if @keyword_subscribe.update(keyword_subscribe_params)
      redirect_to settings_keyword_subscribes_path
    else
      render action: :edit
    end
  end

  def destroy
    @keyword_subscribe.destroy
    redirect_to settings_keyword_subscribes_path
  end

  private

  def set_keyword_subscribe
    @keyword_subscribe = current_account.keyword_subscribes.find(params[:id])
  end

  def set_keyword_subscribes
    @keyword_subscribes = current_account.keyword_subscribes.includes(:list).order('list_id NULLS FIRST', :name).page(params[:page]).per(40)
  end

  def set_lists
    @lists = List.where(account: current_account).all
  end

  def keyword_subscribe_params
    new_params = resource_params.permit!.to_h

    if resource_params[:list_id] == '-1'
      list = List.find_or_create_by!({ account: current_account, title: new_params[:name].presence || "keyword_#{Time.now.strftime('%Y%m%d%H%M%S')}" })
      new_params.merge!({list_id: list.id})
    end

    new_params
  end

  def resource_params
    params.require(:keyword_subscribe).permit(:name, :keyword, :exclude_keyword, :ignorecase, :regexp, :ignore_block, :disabled, :list_id, :media_only)
  end

  def set_body_classes
    @body_classes = 'admin'
  end
end
