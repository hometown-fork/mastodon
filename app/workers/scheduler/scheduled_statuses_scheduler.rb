# frozen_string_literal: true

class Scheduler::ScheduledStatusesScheduler
  include Sidekiq::Worker

  sidekiq_options retry: 0

  def perform
    publish_scheduled_statuses!
    publish_scheduled_announcements!
    unpublish_expired_announcements!
    process_expired_statuses!
  end

  private

  def publish_scheduled_statuses!
    due_statuses.find_each do |scheduled_status|
      PublishScheduledStatusWorker.perform_at(scheduled_status.scheduled_at, scheduled_status.id)
    end
  end

  def due_statuses
    ScheduledStatus.where('scheduled_at <= ?', Time.now.utc + PostStatusService::MIN_SCHEDULE_OFFSET)
  end

  def publish_scheduled_announcements!
    due_announcements.find_each do |announcement|
      PublishScheduledAnnouncementWorker.perform_at(announcement.scheduled_at, announcement.id)
    end
  end

  def due_announcements
    Announcement.unpublished.where('scheduled_at IS NOT NULL AND scheduled_at <= ?', Time.now.utc + PostStatusService::MIN_SCHEDULE_OFFSET)
  end

  def unpublish_expired_announcements!
    expired_announcements.in_batches.update_all(published: false, scheduled_at: nil)
  end

  def expired_announcements
    Announcement.published.where('ends_at IS NOT NULL AND ends_at <= ?', Time.now.utc)
  end

  def process_expired_statuses!
    due_status_expires.find_each(&:queue_action)
  end

  def due_status_expires
    StatusExpire.where('expires_at <= ?', Time.now.utc + PostStatusService::MIN_SCHEDULE_OFFSET)
  end
end
