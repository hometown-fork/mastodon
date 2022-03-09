# frozen_string_literal: true
class Settings::AccountSubscribesController < Settings::BaseController
  layout 'admin'

  before_action :authenticate_user!
  before_action :set_lists, only: [:index, :new, :edit, :update]
  before_action :set_account_subscribings, only: :index
  before_action :set_account_subscribing, only: [:edit, :update, :destroy]

  def index
  end

  def new
    @form_account_subscribing = Form::AccountSubscribe.new
  end

  def create
    @form_account_subscribing = Form::AccountSubscribe.new(account_subscribe_params)
    target_account = AccountSubscribeService.new.call(current_account, @form_account_subscribing.acct, { show_reblogs: @form_account_subscribing.show_reblogs, list_id: @form_account_subscribing.list_id, media_only: @form_account_subscribing.media_only })

    if target_account
      redirect_to settings_account_subscribes_path
    else
      set_account_subscribings

      render :index
    end
  end

  def edit; end

  def update
    if @account_subscribing.update(account_subscribe_params.merge(account: current_account))
      redirect_to settings_account_subscribes_path
    else
      render action: :edit
    end
  end

  def destroy
    UnsubscribeAccountService.new.call(current_account, @account_subscribing.target_account, list_id: @account_subscribing.list_id)
    redirect_to settings_account_subscribes_path
  end

  private

  def set_account_subscribing
    @account_subscribing = current_account.active_subscribes.find(params[:id])
    @form_account_subscribing = Form::AccountSubscribe.new(id: @account_subscribing.id, acct: @account_subscribing.target_account.acct, show_reblogs: @account_subscribing.show_reblogs, list_id: @account_subscribing.list_id, media_only: @account_subscribing.media_only)
  end

  def set_account_subscribings
    @account_subscribings = current_account.active_subscribes.eager_load(:target_account).order('list_id NULLS FIRST', :updated_at).page(params[:page]).per(40)
  end

  def set_lists
    @lists = List.where(account: current_account).all
  end

  def account_subscribe_params
    new_params = resource_params.permit!.to_h

    if resource_params[:list_id] == '-1'
      list = List.find_or_create_by!({ account: current_account, title: new_params[:acct] })
      new_params.merge!({list_id: list.id})
    end

    new_params
  end

  def resource_params
    params.require(:form_account_subscribe).permit(:acct, :show_reblogs, :list_id, :media_only)
  end
end
