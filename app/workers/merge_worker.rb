# frozen_string_literal: true

class MergeWorker
  include Sidekiq::Worker

  def perform(from_account_id, into_account_id, **options)
    options.symbolize_keys!

    if options[:list_id].nil?
      FeedManager.instance.merge_into_home(Account.find(from_account_id), Account.find(into_account_id), **options)
    else
      FeedManager.instance.merge_into_list(Account.find(from_account_id), List.find(options[:list_id]), **options)
    end
  rescue ActiveRecord::RecordNotFound
    true
  ensure
    Redis.current.del("account:#{into_account_id}:regeneration")
  end
end
