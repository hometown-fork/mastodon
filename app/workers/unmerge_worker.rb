# frozen_string_literal: true

class UnmergeWorker
  include Sidekiq::Worker

  sidekiq_options queue: 'pull'

  def perform(from_account_id, into_account_id, **options)
    options.symbolize_keys!

    if options[:list_id].nil?
      FeedManager.instance.unmerge_from_home(Account.find(from_account_id), Account.find(into_account_id))
    else
      FeedManager.instance.unmerge_from_list(Account.find(from_account_id), List.find(options[:list_id]))
    end
  rescue ActiveRecord::RecordNotFound
    true
  end
end
