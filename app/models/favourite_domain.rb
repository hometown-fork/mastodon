# frozen_string_literal: true
# == Schema Information
#
# Table name: favourite_domains
#
#  id         :bigint(8)        not null, primary key
#  account_id :bigint(8)
#  name       :string           not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
class FavouriteDomain < ApplicationRecord
  belongs_to :account, inverse_of: :favourite_domains, required: true

  validates :name, presence: true, on: :create
  validate :validate_favourite_domains_limit, on: :create

  private

  def validate_favourite_domains_limit
    errors.add(:base, I18n.t('favourite_domains.errors.limit')) if account.favourite_domains.count >= 10
  end
end
