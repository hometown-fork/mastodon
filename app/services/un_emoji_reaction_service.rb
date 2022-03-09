# frozen_string_literal: true

class UnEmojiReactionService < BaseService
  include Payloadable

  def call(account, status)
    emoji_reaction = EmojiReaction.find_by!(account: account, status: status)

    emoji_reaction.destroy!
    create_notification(emoji_reaction)
    emoji_reaction
  end

  private

  def create_notification(emoji_reaction)
    status = emoji_reaction.status

    if status.account.local?
      ActivityPub::RawDistributionWorker.perform_async(build_json(emoji_reaction), status.account.id)
    elsif status.account.activitypub?
      ActivityPub::DeliveryWorker.perform_async(build_json(emoji_reaction), emoji_reaction.account_id, status.account.inbox_url)
    end
  end

  def build_json(emoji_reaction)
    Oj.dump(serialize_payload(emoji_reaction, ActivityPub::UndoEmojiReactionSerializer))
  end
end
