# frozen_string_literal: true

class Api::V1::DomainSubscribesController < Api::BaseController
  before_action -> { doorkeeper_authorize! :read, :'read:follows' }, only: :index
  before_action -> { doorkeeper_authorize! :write, :'write:follows' }, except: :index

  before_action :require_user!
  before_action :set_domain_subscribe, except: [:index, :create]

  def index
    @domain_subscribes = DomainSubscribe.where(account: current_account).all
    render json: @domain_subscribes, each_serializer: REST::DomainSubscribeSerializer
  end

  def create
    @domain_subscribe = DomainSubscribe.create!(domain_subscribe_params.merge(account: current_account))
    render json: @domain_subscribe, serializer: REST::DomainSubscribeSerializer
  end

  def destroy
    @domain_subscribe.destroy!
    render_empty
  end

  private

  def set_domain_subscribe
    @domain_subscribe = DomainSubscribe.where(account: current_account).find(params[:id])
  end

  def domain_subscribe_params
    params.permit(:domain, :list_id, :exclude_reblog, :media_only)
  end
end
