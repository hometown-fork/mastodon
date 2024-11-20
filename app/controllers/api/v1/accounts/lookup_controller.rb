# frozen_string_literal: true

class Api::V1::Accounts::LookupController < Api::BaseController
  skip_before_action :require_authenticated_user!, only: :show
  before_action -> { authorize_if_got_token! :read, :'read:accounts' }
  before_action :set_account

  def show
    if user_would_block_unauthenticated_api_access?(@account)
      user_blocks_unauthenticated_api_access and return
    end
    render json: @account, serializer: REST::AccountSerializer
  end

  private

  def set_account
    @account = ResolveAccountService.new.call(params[:acct], skip_webfinger: true) || raise(ActiveRecord::RecordNotFound)
  rescue Addressable::URI::InvalidURIError
    raise(ActiveRecord::RecordNotFound)
  end
end
