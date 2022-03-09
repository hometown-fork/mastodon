# frozen_string_literal: true

class Settings::FavouriteDomainsController < Settings::BaseController
  layout 'admin'

  before_action :authenticate_user!
  before_action :set_favourite_domains, only: :index
  before_action :set_favourite_domain, except: [:index, :create]

  def index
    @favourite_domain = FavouriteDomain.new
  end

  def create
    @favourite_domain = current_account.favourite_domains.new(favourite_domain_params)

    if @favourite_domain.save
      redirect_to settings_favourite_domains_path
    else
      set_favourite_domains

      render :index
    end
  end

  def destroy
    @favourite_domain.destroy!
    redirect_to settings_favourite_domains_path
  end

  private

  def set_favourite_domain
    @favourite_domain = current_account.favourite_domains.find(params[:id])
  end

  def set_favourite_domains
    @favourite_domains = current_account.favourite_domains.order(:updated_at).reject(&:new_record?)
  end

  def favourite_domain_params
    params.require(:favourite_domain).permit(:name)
  end
end
