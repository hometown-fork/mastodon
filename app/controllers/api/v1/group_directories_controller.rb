# frozen_string_literal: true

class Api::V1::GroupDirectoriesController < Api::BaseController
  before_action :set_accounts

  def show
    render json: @accounts, each_serializer: REST::AccountSerializer
  end

  private

  def set_accounts
    @accounts = accounts_scope.offset(params[:offset]).limit(limit_param(DEFAULT_ACCOUNTS_LIMIT))
  end

  def accounts_scope
    Account.discoverable.groups.tap do |scope|
      scope.merge!(Account.by_recent_status)                               if params[:order].blank? || params[:order] == 'active'
      scope.merge!(Account.order(id: :desc))                               if params[:order] == 'new'
      scope.merge!(Account.not_excluded_by_account(current_account))       if current_account
      scope.merge!(Account.not_domain_blocked_by_account(current_account)) if current_account
    end
  end
end
