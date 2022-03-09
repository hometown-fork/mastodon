# frozen_string_literal: true

class AccountSubscribeService < BaseService
  # Subscribe a remote user
  # @param [Account] source_account From which to subscribe
  # @param [String, Account] uri User URI to subscribe in the form of username@domain (or account record)
  def call(source_account, target_acct, options = {})
    @source_account = source_account
    @options = { show_reblogs: true, list_id: nil, media_only: false }.merge(options)

    if target_acct.class.name == 'Account'
      @target_account = target_acct
    else
      begin
        @target_account = ResolveAccountService.new.call(target_acct, skip_webfinger: true)
        @target_account ||= ResolveAccountService.new.call(target_acct, skip_webfinger: false)
      rescue
        @target_account = nil
      end
    end

    raise ActiveRecord::RecordNotFound if @target_account.nil? || @target_account.id == @source_account.id || @target_account.suspended?
    raise Mastodon::NotPermittedError  if @target_account.blocking?(@source_account) || @source_account.blocking?(@target_account) || (!@target_account.local? && @target_account.ostatus?) || @source_account.domain_blocking?(@target_account.domain)

    if @source_account.subscribing?(@target_account, @options[:list_id])
      return change_subscribe_options!
    end

    ActivityTracker.increment('activity:interactions')

    subscribe = @source_account.subscribe!(@target_account, @options)
    MergeWorker.perform_async(@target_account.id, @source_account.id, **@options.merge(public_only: true))
    subscribe
  end

  private

  def change_subscribe_options!
    @source_account.subscribe!(@target_account, @options)
  end

end
