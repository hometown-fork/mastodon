# frozen_string_literal: true

class UnsubscribeAccountService < BaseService
  # UnsubscribeAccount
  # @param [Account] source_account Where to unsubscribe from
  # @param [Account] target_account Which to unsubscribe
  def call(source_account, target_account, options = {})
    if (options[:list_id] == :all)
      subscribes = AccountSubscribe.where(account: source_account, target_account: target_account)
    else
      subscribes = AccountSubscribe.where(account: source_account, target_account: target_account, list_id: options[:list_id])
    end

    subscribes.each do |subscribe|
      list_id = subscribe.list_id
      subscribe.destroy!
      if list_id.nil? && !source_account.delivery_following?(target_account)
        UnmergeWorker.perform_async(target_account.id, source_account.id)
      elsif !ListAccount.where(list_id: list_id, account_id: target_account.id).exists?
        UnmergeWorker.perform_async(target_account.id, source_account.id, list_id: list_id)
      end
    end
  end
end
