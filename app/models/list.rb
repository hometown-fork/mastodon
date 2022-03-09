# frozen_string_literal: true
# == Schema Information
#
# Table name: lists
#
#  id             :bigint(8)        not null, primary key
#  account_id     :bigint(8)        not null
#  title          :string           default(""), not null
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#  replies_policy :integer          default("list"), not null
#  is_exclusive   :boolean          default(FALSE)
#  favourite      :boolean          default(FALSE), not null
#

class List < ApplicationRecord
  include Paginable

  PER_ACCOUNT_LIMIT = 50

  enum replies_policy: [:list, :followed, :none], _prefix: :show

  belongs_to :account, optional: true

  has_many :list_accounts, inverse_of: :list, dependent: :destroy
  has_many :accounts, through: :list_accounts

  has_many :account_subscribes, inverse_of: :list, dependent: :destroy
  has_many :subscribes, through: :account_subscribes, source: :target_account

  has_many :follow_tags, inverse_of: :list, dependent: :destroy
  has_many :tags, through: :follow_tags, source: :tag

  has_many :domain_subscribes, inverse_of: :list, dependent: :destroy
  has_many :keyword_subscribes, inverse_of: :list, dependent: :destroy

  validates :title, presence: true

  validates_each :account_id, on: :create do |record, _attr, value|
    record.errors.add(:base, I18n.t('lists.errors.limit')) if List.where(account_id: value).count >= PER_ACCOUNT_LIMIT
  end

  before_destroy :clean_feed_manager

  scope :favourites,  -> { where(favourite: true) }

  def favourite?
    favourite
  end

  def favourite!
    update!(favourite: true)
  end

  def unfavourite!
    update!(favourite: false)
  end

  private

  def clean_feed_manager
    FeedManager.instance.clean_feeds!(:list, [id])
  end
end
