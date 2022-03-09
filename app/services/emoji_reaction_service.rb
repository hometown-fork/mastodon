# frozen_string_literal: true

class EmojiReactionService < BaseService
  include Authorization
  include Payloadable

  def call(account, status, emoji)
    emoji_reaction = EmojiReaction.find_by(account_id: account.id, status_id: status.id)

    return emoji_reaction unless emoji_reaction.nil?

    shortcode, domain = emoji.split("@")

    custom_emoji = CustomEmoji.find_by(shortcode: shortcode, domain: domain)

    emoji_reaction = EmojiReaction.create!(account: account, status: status, name: shortcode, custom_emoji: custom_emoji)

    create_notification(emoji_reaction)
    bump_potential_friendship(account, status)

    emoji_reaction
  end

  private 

  def create_notification(emoji_reaction)
    status = emoji_reaction.status

    if status.account.local?
      NotifyService.new.call(status.account, :emoji_reaction, emoji_reaction) if status.account.local?
      ActivityPub::RawDistributionWorker.perform_async(build_json(emoji_reaction), status.account.id)
    elsif status.account.activitypub?
      ActivityPub::DeliveryWorker.perform_async(build_json(emoji_reaction), emoji_reaction.account_id, status.account.inbox_url)
    end
  end

  def bump_potential_friendship(account, status)
    ActivityTracker.increment('activity:interactions')
    return if account.following?(status.account_id)
    PotentialFriendshipTracker.record(account.id, status.account_id, :emoji_reaction)
  end

  def build_json(emoji_reaction)
    Oj.dump(serialize_payload(emoji_reaction, ActivityPub::EmojiReactionSerializer))
  end
end
