# frozen_string_literal: true

require_relative '../../config/boot'
require_relative '../../config/environment'
require_relative 'cli_helper'

module Mastodon
  class CacheCLI < Thor
    include CLIHelper

    def self.exit_on_failure?
      true
    end

    desc 'clear', 'Clear out the cache storage'
    def clear
      Rails.cache.clear
      say('OK', :green)
    end

    option :concurrency, type: :numeric, default: 5, aliases: [:c]
    option :verbose, type: :boolean, aliases: [:v]
    option :reaction_only, type: :boolean
    desc 'recount TYPE', 'Update hard-cached counters'
    long_desc <<~LONG_DESC
      Update hard-cached counters of TYPE by counting referenced
      records from scratch. TYPE can be "accounts" or "statuses".

      It may take a very long time to finish, depending on the
      size of the database.
    LONG_DESC
    def recount(type)
      case type
      when 'accounts'
        processed, = parallelize_with_progress(Account.local.includes(:account_stat)) do |account|
          account_stat                   = account.account_stat
          account_stat.following_count   = account.active_relationships.count
          account_stat.followers_count   = account.passive_relationships.count
          account_stat.subscribing_count = account.active_subscribes.count
          account_stat.statuses_count    = account.statuses.where.not(visibility: :direct).count

          account_stat.save if account_stat.changed?
        end
      when 'statuses'
        statuses = Status.includes(:status_stat)
        statuses = statuses.joins(:emoji_reactions).distinct if options[:reaction_only]

        processed, = parallelize_with_progress(statuses) do |status|
          status_stat                       = status.status_stat
          status_stat.replies_count         = status.replies.where.not(visibility: :direct).count
          status_stat.reblogs_count         = status.reblogs.count
          status_stat.favourites_count      = status.favourites.count
          status_stat.emoji_reactions_cache = status.generate_grouped_emoji_reactions

          status_stat.save if status_stat.changed?
        end
      else
        say("Unknown type: #{type}", :red)
        exit(1)
      end

      say
      say("OK, recounted #{processed} records", :green)
    end
  end
end
