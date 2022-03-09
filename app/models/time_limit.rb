# frozen_string_literal: true

class TimeLimit
  TIME_LIMIT_RE = /^exp(?<value>\d+)(?<unit>[mhd])$/
  VALID_DURATION = (1.minute..430.days)

  def self.from_tags(tags, created_at = Time.now.utc)
    return unless tags

    tags.map { |tag| new(tag.name, created_at) }.find(&:valid?)
  end

  def self.from_status(status)
    return unless status

    status = status.reblog if status.reblog?
    return unless status.local?

    from_tags(status.tags, status.created_at)
  end

  def initialize(name, created_at = Time.now.utc)
    @name       = name
    @created_at = created_at
  end

  def valid?
    VALID_DURATION.include?(to_duration)
  end

  def to_duration
    matched = @name.match(TIME_LIMIT_RE)
    return 0 unless matched

    case matched[:unit]
    when 'm'
      matched[:value].to_i.minutes
    when 'h'
      matched[:value].to_i.hours
    when 'd'
      matched[:value].to_i.days
    else
      0
    end
  end

  def to_datetime
    @created_at + to_duration
  end
end
