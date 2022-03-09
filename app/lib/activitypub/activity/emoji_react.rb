# frozen_string_literal: true

class ActivityPub::Activity::EmojiReact < ActivityPub::Activity
  def perform
    original_status = status_from_uri(object_uri)
    shortcode       = @json['content']

    return if original_status.nil? || !original_status.account.local? || delete_arrived_first?(@json['id']) || @account.reacted?(original_status, shortcode)

    reaction = original_status.emoji_reactions.create!(account: @account, name: shortcode, uri: @json['id'])

    NotifyService.new.call(original_status.account, :emoji_reaction, reaction) if original_status.account.local?
  end
end
