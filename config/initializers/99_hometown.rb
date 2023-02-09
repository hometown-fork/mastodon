# frozen_string_literal: true

Rails.application.configure do
  config.x.local_timeline_exclude_bots = ENV['LOCAL_TIMELINE_EXCLUDE_BOTS'] == 'true'
end
