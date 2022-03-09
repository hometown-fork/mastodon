# == Schema Information
#
# Table name: account_subscribes
#
#  id                :bigint(8)        not null, primary key
#  account_id        :bigint(8)
#  target_account_id :bigint(8)
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  list_id           :bigint(8)
#  show_reblogs      :boolean          default(TRUE), not null
#  media_only        :boolean          default(FALSE), not null
#

class AccountSubscribe < ApplicationRecord
  include Paginable
  include RelationshipCacheable

  belongs_to :account
  belongs_to :target_account, class_name: 'Account'
  belongs_to :list, optional: true

  validates :account_id, uniqueness: { scope: [:target_account_id, :list_id] }

  scope :recent, -> { reorder(id: :desc) }
  scope :subscribed_lists, ->(account) { AccountSubscribe.where(target_account_id: account.id).where.not(list_id: nil).select(:list_id).uniq }
  scope :home, -> { where(list_id: nil) }
  scope :list, -> { where.not(list_id: nil) }
  scope :with_reblog, ->(reblog) { where(show_reblogs: true) if reblog }
  scope :with_media, ->(status) { where(media_only: false) unless status.with_media? }

  after_create :increment_cache_counters
  after_destroy :decrement_cache_counters

  attr_accessor :acct

  def acct=(val)
    return if val.nil?

    target_account = ResolveAccountService.new.call(acct, skip_webfinger: true)
    target_account ||= ResolveAccountService.new.call(acct, skip_webfinger: false)
  end

  def acct
    target_account&.acct
  end

  private

  def home?
    list_id.nil?
  end

  def increment_cache_counters
    account&.increment_count!(:subscribing_count)
  end

  def decrement_cache_counters
    account&.decrement_count!(:subscribing_count)
  end

end
