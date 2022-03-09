# frozen_string_literal: true

class AccountSearchFilter
  attr_reader :target_account, :account

  def initialize(target_account, account, preloaded_relations = {})
    @target_account      = target_account
    @account             = account
    @preloaded_relations = preloaded_relations
  end

  def filtered?
    return false if !account.nil? && account.id == target_account.id
    (account_present? && filtered_account?) || silenced_account?
  end

  private

  def account_present?
    !account.nil?
  end

  def filtered_account?
    blocking_account? || blocked_by_account? || blocking_domain? || muting_account?
  end

  def blocking_account?
    @preloaded_relations[:blocking] ? @preloaded_relations[:blocking][target_account.id] : account.blocking?(target_account)
  end

  def blocked_by_account?
    @preloaded_relations[:blocked_by] ? @preloaded_relations[:blocked_by][target_account.id] : target_account.blocking?(account)
  end

  def blocking_domain?
    @preloaded_relations[:domain_blocking] ? @preloaded_relations[:domain_blocking][target_account.id] : account.domain_blocking?(target_account.domain)
  end

  def muting_account?
    @preloaded_relations[:muting] ? @preloaded_relations[:muting][target_account.id] : account.muting?(target_account)
  end

  def silenced_account?
    !account&.silenced? && target_account_silenced? && !account_following_target_account?
  end

  def target_account_silenced?
    target_account.silenced?
  end

  def account_following_target_account?
    @preloaded_relations[:following] ? @preloaded_relations[:following][target_account.id] : account&.following?(target_account)
  end
end
