# frozen_string_literal: true

module InviteLimiter
  extend ActiveSupport::Concern

  def invite_limiter(by, options = {})
    return @invite_limiter if defined?(@invite_limiter)

    @invite_limiter = RateLimiter.new(by, options)
  end

  class_methods do
    def invite_limit(options = {})
      after_create do
        by = public_send(options[:by])

        invite_limiter(by, options).record!
        @invite_limit_recorded = true
      end

      after_rollback do
        invite_limiter(public_send(options[:by]), options).rollback! if @invite_limit_recorded
      end
    end
  end
end
