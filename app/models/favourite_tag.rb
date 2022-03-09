# frozen_string_literal: true
# == Schema Information
#
# Table name: favourite_tags
#
#  id         :bigint(8)        not null, primary key
#  account_id :bigint(8)
#  tag_id     :bigint(8)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class FavouriteTag < ApplicationRecord
  belongs_to :account, inverse_of: :favourite_tags, required: true
  belongs_to :tag, inverse_of: :favourite_tags, required: true

  delegate :name, to: :tag, allow_nil: true

  validates_associated :tag, on: :create
  validates :name, presence: true, on: :create
  validate :validate_favourite_tags_limit, on: :create

  def name=(str)
    self.tag = Tag.find_or_create_by_names(str.strip)&.first
  end

  private

  def validate_favourite_tags_limit
    errors.add(:base, I18n.t('favourite_tags.errors.limit')) if account.favourite_tags.count >= 10
  end
end
