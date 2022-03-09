# == Schema Information
#
# Table name: domain_subscribes
#
#  id             :bigint(8)        not null, primary key
#  account_id     :bigint(8)
#  list_id        :bigint(8)
#  domain         :string           default(""), not null
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#  exclude_reblog :boolean          default(TRUE)
#  media_only     :boolean          default(FALSE), not null
#

class DomainSubscribe < ApplicationRecord
  belongs_to :account
  belongs_to :list, optional: true

  validates :domain, presence: true
  validates :account_id, uniqueness: { scope: [:domain, :list_id] }

  scope :domain_to_home, ->(domain) { where(domain: domain).where(list_id: nil) }
  scope :domain_to_list, ->(domain) { where(domain: domain).where.not(list_id: nil) }
  scope :with_reblog, ->(reblog) { where(exclude_reblog: false) if reblog }
  scope :with_media, ->(status) { where(media_only: false) unless status.with_media? }
end
