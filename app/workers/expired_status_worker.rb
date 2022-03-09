# frozen_string_literal: true

class ExpiredStatusWorker
  include Sidekiq::Worker

  sidekiq_options retry: 0, dead: false

  def perform(status_id)
    status        = Status.find(status_id)
    status_expire = status.status_expire

    RemoveStatusService.new.call(status, redraft: false, mark_expired: status_expire.present? && status_expire.expires_mark?)
  rescue ActiveRecord::RecordNotFound
    true
  end
end
