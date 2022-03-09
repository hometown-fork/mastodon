# == Schema Information
#
# Table name: status_expires
#
#  id         :bigint(8)        not null, primary key
#  status_id  :bigint(8)        not null
#  expires_at :datetime         not null
#  action     :integer          default("delete"), not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
class StatusExpire < ApplicationRecord
  enum action: [:delete, :mark], _prefix: :expires

  belongs_to :status

  after_commit :reset_parent_cache

  def queue_action
    ExpiredStatusWorker.perform_at(expires_at, status_id)
  end    

  private
  
  def reset_parent_cache
    Rails.cache.delete("statuses/#{status_id}")
  end
end
