# frozen_string_literal: true

class ExpiresValidator < ActiveModel::Validator
  MAX_EXPIRATION   = 1.month.freeze
  MIN_EXPIRATION   = 1.minutes.freeze

  def validate(status)
    current_time = Time.now.utc

    status.errors.add(:expires_at, I18n.t('statuses.errors.duration_too_long')) if status.expires? && status.expires_at - current_time > MAX_EXPIRATION
    status.errors.add(:expires_at, I18n.t('statuses.errors.duration_too_short')) if status.expires? && (status.expires_at - current_time).ceil < MIN_EXPIRATION
  end
end
