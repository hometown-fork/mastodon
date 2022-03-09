# frozen_string_literal: true
class Settings::DomainSubscribesController < Settings::BaseController
  layout 'admin'

  before_action :authenticate_user!
  before_action :set_lists, only: [:index, :new, :edit, :update]
  before_action :set_domain_subscribes, only: :index
  before_action :set_domain_subscribe, only: [:edit, :update, :destroy]

  def index
    @domain_subscribe = DomainSubscribe.new
  end

  def new
    @domain_subscribe = current_account.domain_subscribes.build
  end

  def create
    @domain_subscribe = current_account.domain_subscribes.new(domain_subscribe_params)

    if @domain_subscribe.save
      redirect_to settings_domain_subscribes_path
    else
      set_domain_subscribe

      render :index
    end
  end

  def edit; end

  def update
    if @domain_subscribe.update(domain_subscribe_params)
      redirect_to settings_domain_subscribes_path
    else
      render action: :edit
    end
  end

  def destroy
    @domain_subscribe.destroy!
    redirect_to settings_domain_subscribes_path
  end

  private

  def set_domain_subscribe
    @domain_subscribe = current_account.domain_subscribes.find(params[:id])
  end

  def set_domain_subscribes
    @domain_subscribes = current_account.domain_subscribes.includes(:list).order('list_id NULLS FIRST', :domain).page(params[:page]).per(40)
  end

  def set_lists
    @lists = List.where(account: current_account).all
  end

  def domain_subscribe_params
    new_params = resource_params.permit!.to_h

    if resource_params[:list_id] == '-1'
      list = List.find_or_create_by!({ account: current_account, title: new_params[:domain] })
      new_params.merge!({list_id: list.id})
    end

    new_params
  end

  def resource_params
    params.require(:domain_subscribe).permit(:domain, :list_id, :exclude_reblog, :media_only)
  end
end
