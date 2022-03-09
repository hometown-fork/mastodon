# frozen_string_literal: true

class ProcessHashtagsService < BaseService
  def call(status, tags = [])
    tags    = Extractor.extract_hashtags(status.text) if status.local?
    records = []

    Tag.find_or_create_by_names(tags) do |tag|
      status.tags << tag
      records << tag
      tag.use!(status.account, status: status, at_time: status.created_at) if status.public_visibility? && !tag.name.match(TimeLimit::TIME_LIMIT_RE)
    end

    if status.local?
      time_limit = TimeLimit.from_status(status)
      if (time_limit.present?)
        status.update(expires_at: time_limit.to_datetime, expires_action: :mark)
      end
    end

    return unless status.distributable?

    status.account.featured_tags.where(tag_id: records.map(&:id)).each do |featured_tag|
      featured_tag.increment(status.created_at)
    end
  end
end
