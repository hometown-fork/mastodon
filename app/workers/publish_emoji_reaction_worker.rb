# frozen_string_literal: true

class PublishEmojiReactionWorker
  include Sidekiq::Worker
  include Redisable
  include RoutingHelper

  def perform(status_id, name, custom_emoji_id)
    status       = Status.find(status_id)
    custom_emoji = CustomEmoji.find(custom_emoji_id) if custom_emoji_id.present?

    emoji_reaction,  = status.emoji_reactions.where(name: name, custom_emoji_id: custom_emoji_id).group(:status_id, :name, :custom_emoji_id).select('name, custom_emoji_id, count(*) as count, false as me')
    emoji_reaction ||= status.emoji_reactions.new(name: name, custom_emoji_id: custom_emoji_id)

    payload = InlineRenderer.render(emoji_reaction, nil, :emoji_reaction).tap { |h|
      h[:status_id] = status_id.to_s
      if custom_emoji.present?
        h[:url]        = full_asset_url(custom_emoji.image.url)
        h[:static_url] = full_asset_url(custom_emoji.image.url(:static))
        h[:domain]     = custom_emoji.domain
      end
    }
    payload = Oj.dump(event: :'emoji_reaction', payload: payload)

    FeedManager.instance.with_active_accounts do |account|
      redis.publish("timeline:#{account.id}", payload) if redis.exists?("subscribed:timeline:#{account.id}")
    end
  rescue ActiveRecord::RecordNotFound
    true
  end
end
