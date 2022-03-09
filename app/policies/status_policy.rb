# frozen_string_literal: true

class StatusPolicy < ApplicationPolicy
  def initialize(current_account, record, preloaded_account_relations = {}, preloaded_status_relations = {})
    super(current_account, record)

    @preloaded_account_relations = preloaded_account_relations
    @preloaded_status_relations  = preloaded_status_relations
  end

  delegate :reply?, :expired?, to: :record

  def index?
    staff?
  end

  def show?
    return false if local_only? && (current_account.nil? || !current_account.local?)
    return false if author.suspended?
    return false unless expired_show?

    if requires_mention?
      owned? || mention_exists?
    elsif private?
      owned? || following_author? || mention_exists?
    else
      current_account.nil? || (!author_blocking? && !author_blocking_domain?)
    end
  end

  def expired_show?
    !expired? || owned? || favourited_status? || bookmarked_status? || emoji_reactioned_status?
  end

  def reblog?
    !requires_mention? && (!private? || owned?) && show? && !blocking_author?
  end

  def favourite?
    show? && !blocking_author?
  end

  def destroy?
    staff? || owned?
  end

  alias unreblog? destroy?

  def update?
    staff?
  end

  def show_mentions?
    limited? && owned? && (!reply? || record.thread.conversation_id != record.conversation_id)
  end

  private

  def requires_mention?
    record.direct_visibility? || record.limited_visibility?
  end

  def owned?
    author.id == current_account&.id
  end

  def private?
    record.private_visibility?
  end

  def limited?
    record.limited_visibility?
  end

  def mention_exists?
    return false if current_account.nil?

    if record.mentions.loaded?
      record.mentions.any? { |mention| mention.account_id == current_account.id }
    else
      record.mentions.where(account: current_account).exists?
    end
  end

  def author_blocking_domain?
    return false if current_account.nil? || current_account.domain.nil?

    author.domain_blocking?(current_account.domain)
  end

  def blocking_author?
    return false if current_account.nil?

    @preloaded_account_relations[:blocking] ? @preloaded_account_relations[:blocking][author.id] : current_account.blocking?(author)
  end

  def author_blocking?
    return false if current_account.nil?

    @preloaded_account_relations[:blocked_by] ? @preloaded_account_relations[:blocked_by][author.id] : author.blocking?(current_account)
  end

  def following_author?
    return false if current_account.nil?

    @preloaded_account_relations[:following] ? @preloaded_account_relations[:following][author.id] : current_account.following?(author)
  end

  def favourited_status?
    return false if current_account.nil?

    @preloaded_status_relations[:favourites_map] ? @preloaded_status_relations[:favourites_map][record.id] : current_account.favourited?(record)
  end

  def bookmarked_status?
    return false if current_account.nil?

    @preloaded_status_relations[:bookmarks_map] ? @preloaded_status_relations[:bookmarks_map][record.id] : current_account.bookmarked?(record)
  end

  def emoji_reactioned_status?
    return false if current_account.nil?

    @preloaded_status_relations[:emoji_reactions_map] ? @preloaded_status_relations[:emoji_reactions_map][record.id] : current_account.emoji_reactioned?(record)
  end

  def author
    record.account
  end

  def local_only?
    record.local_only?
  end
end
