# frozen_string_literal: true

class REST::NotificationSerializer < ActiveModel::Serializer
  attributes :id, :type, :created_at

  belongs_to :from_account, key: :account, serializer: REST::AccountSerializer
  belongs_to :target_status, key: :status, if: :status_type?, serializer: REST::StatusSerializer
  belongs_to :emoji_reaction, if: :emoji_reaction?
  attribute :reblog_visibility, if: :reblog?

  def id
    object.id.to_s
  end

  def status_type?
    [:favourite, :reblog, :status, :mention, :poll, :emoji_reaction].include?(object.type)
  end

  def reblog?
    object.type == :reblog
  end

  def emoji_reaction?
    object.type == :emoji_reaction
  end

  class EmojiReactionSerializer < REST::EmojiReactionSerializer
    attributes :me

    def me
       false
    end
  end
end
