# frozen_string_literal: true

class Api::V1::FavouriteDomainsController < Api::BaseController
  before_action -> { doorkeeper_authorize! :read, :'read:favourite_domains' }, only: [:index, :show]
  before_action -> { doorkeeper_authorize! :write, :'write:favourite_domains' }, except: [:index, :show]

  before_action :require_user!
  before_action :set_favourite_domain, except: [:index, :create]

  def index
    @favourite_domains = FavouriteDomain.where(account: current_account).all
    render json: @favourite_domains, each_serializer: REST::FavouriteDomainSerializer
  end

  def show
    render json: @favourite_domain, serializer: REST::FavouriteDomainSerializer
  end

  def create
    @favourite_domain = FavouriteDomain.create!(favourite_domain_params.merge(account: current_account))
    render json: @favourite_domain, serializer: REST::FavouriteDomainSerializer
  end

  def update
    @favourite_domain.update!(favourite_domain_params)
    render json: @favourite_domain, serializer: REST::FavouriteDomainSerializer
  end

  def destroy
    @favourite_domain.destroy!
    render_empty
  end

  private

  def set_favourite_domain
    @favourite_domain = FavouriteDomain.where(account: current_account).find(params[:id])
  end

  def favourite_domain_params
    params.permit(:name)
  end
end
