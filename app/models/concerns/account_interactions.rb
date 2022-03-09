# frozen_string_literal: true

module AccountInteractions
  extend ActiveSupport::Concern

  included do
    # Follow relations
    has_many :follow_requests, dependent: :destroy

    has_many :active_relationships,  class_name: 'Follow', foreign_key: 'account_id',        dependent: :destroy
    has_many :passive_relationships, class_name: 'Follow', foreign_key: 'target_account_id', dependent: :destroy

    has_many :following, -> { order('follows.id desc') }, through: :active_relationships,  source: :target_account
    has_many :followers, -> { order('follows.id desc') }, through: :passive_relationships, source: :account
    has_many :delivery_following, -> { where('follows.delivery').order('follows.id desc') }, through: :active_relationships,  source: :target_account
    has_many :delivery_followers, -> { where('follows.delivery').order('follows.id desc') }, through: :passive_relationships, source: :account

    # Account notes
    has_many :account_notes, dependent: :destroy

    # Block relationships
    has_many :block_relationships, class_name: 'Block', foreign_key: 'account_id', dependent: :destroy
    has_many :blocking, -> { order('blocks.id desc') }, through: :block_relationships, source: :target_account
    has_many :blocked_by_relationships, class_name: 'Block', foreign_key: :target_account_id, dependent: :destroy
    has_many :blocked_by, -> { order('blocks.id desc') }, through: :blocked_by_relationships, source: :account

    # Mute relationships
    has_many :mute_relationships, class_name: 'Mute', foreign_key: 'account_id', dependent: :destroy
    has_many :muting, -> { order('mutes.id desc') }, through: :mute_relationships, source: :target_account
    has_many :muted_by_relationships, class_name: 'Mute', foreign_key: :target_account_id, dependent: :destroy
    has_many :muted_by, -> { order('mutes.id desc') }, through: :muted_by_relationships, source: :account
    has_many :conversation_mutes, dependent: :destroy
    has_many :domain_blocks, class_name: 'AccountDomainBlock', dependent: :destroy
    has_many :announcement_mutes, dependent: :destroy

    # Subscribers
    has_many :active_subscribes,  class_name: 'AccountSubscribe', foreign_key: 'account_id',        dependent: :destroy
    has_many :passive_subscribes, class_name: 'AccountSubscribe', foreign_key: 'target_account_id', dependent: :destroy

    has_many :subscribing, through: :active_subscribes,  source: :target_account
    has_many :subscribers, through: :passive_subscribes, source: :account
  end

  def follow!(other_account, reblogs: nil, notify: nil, delivery: true, uri: nil, rate_limit: false, bypass_limit: false)
    rel = active_relationships.create_with(show_reblogs: reblogs.nil? ? true : reblogs, notify: notify.nil? ? false : notify, delivery: delivery.nil? ? true : delivery, uri: uri, rate_limit: rate_limit, bypass_follow_limit: bypass_limit)
                              .find_or_create_by!(target_account: other_account)

    rel.show_reblogs = reblogs  unless reblogs.nil?
    rel.notify       = notify   unless notify.nil?
    rel.delivery     = delivery unless delivery.nil?

    rel.save! if rel.changed?

    remove_potential_friendship(other_account)

    rel
  end

  def request_follow!(other_account, reblogs: nil, notify: nil, delivery: nil, uri: nil, rate_limit: false, bypass_limit: false)
    rel = follow_requests.create_with(show_reblogs: reblogs.nil? ? true : reblogs, notify: notify.nil? ? false : notify, delivery: delivery.nil? ? true : delivery, uri: uri, rate_limit: rate_limit, bypass_follow_limit: bypass_limit)
                         .find_or_create_by!(target_account: other_account)

    rel.show_reblogs = reblogs  unless reblogs.nil?
    rel.notify       = notify   unless notify.nil?
    rel.delivery     = delivery unless delivery.nil?

    rel.save! if rel.changed?

    remove_potential_friendship(other_account)

    rel
  end

  def block!(other_account, uri: nil)
    remove_potential_friendship(other_account)
    block_relationships.create_with(uri: uri)
                       .find_or_create_by!(target_account: other_account)
  end

  def mute!(other_account, notifications: nil, duration: 0)
    notifications = true if notifications.nil?
    mute = mute_relationships.create_with(hide_notifications: notifications).find_or_initialize_by(target_account: other_account)
    mute.expires_in = duration.zero? ? nil : duration
    mute.save!

    remove_potential_friendship(other_account)

    # When toggling a mute between hiding and allowing notifications, the mute will already exist, so the find_or_create_by! call will return the existing Mute without updating the hide_notifications attribute. Therefore, we check that hide_notifications? is what we want and set it if it isn't.
    if mute.hide_notifications? != notifications
      mute.update!(hide_notifications: notifications)
    end

    mute
  end

  def mute_conversation!(conversation)
    conversation_mutes.find_or_create_by!(conversation: conversation)
  end

  def block_domain!(other_domain)
    domain_blocks.find_or_create_by!(domain: other_domain)
  end

  def unfollow!(other_account)
    follow = active_relationships.find_by(target_account: other_account)
    follow&.destroy
  end

  def unblock!(other_account)
    block = block_relationships.find_by(target_account: other_account)
    block&.destroy
  end

  def unmute!(other_account)
    mute = mute_relationships.find_by(target_account: other_account)
    mute&.destroy
  end

  def unmute_conversation!(conversation)
    mute = conversation_mutes.find_by(conversation: conversation)
    mute&.destroy!
  end

  def unblock_domain!(other_domain)
    block = domain_blocks.find_by(domain: other_domain)
    block&.destroy
  end

  def subscribe!(other_account, options = {})
    options = { show_reblogs: true, list_id: nil, media_only: false }.merge(options)

    rel = active_subscribes.create_with(show_reblogs: options[:show_reblogs], media_only: options[:media_only] || false)
                           .find_or_create_by!(target_account: other_account, list_id: options[:list_id])

    rel.update!(show_reblogs: options[:show_reblogs], media_only: options[:media_only] || false)
    remove_potential_friendship(other_account)

    rel
  end

  def following?(other_account)
    active_relationships.where(target_account: other_account).exists?
  end

  def following_anyone?
    active_relationships.exists?
  end

  def not_following_anyone?
    !following_anyone?
  end

  def delivery_following?(other_account)
    active_relationships.where(target_account: other_account, delivery: true).exists?
  end

  def mutual?(other_account)
    following?(other_account) && other_account.following?(self)
  end

  def blocking?(other_account)
    block_relationships.where(target_account: other_account).exists?
  end

  def domain_blocking?(other_domain)
    domain_blocks.where(domain: other_domain).exists?
  end

  def muting?(other_account)
    mute_relationships.where(target_account: other_account).exists?
  end

  def muting_conversation?(conversation)
    conversation_mutes.where(conversation: conversation).exists?
  end

  def muting_notifications?(other_account)
    mute_relationships.where(target_account: other_account, hide_notifications: true).exists?
  end

  def muting_reblogs?(other_account)
    active_relationships.where(target_account: other_account, show_reblogs: false).exists?
  end

  def requested?(other_account)
    follow_requests.where(target_account: other_account).exists?
  end

  def favourited?(status)
    status.proper.favourites.where(account: self).exists?
  end

  def reacted?(status, name, custom_emoji = nil)
    status.proper.emoji_reactions.where(account: self, name: name, custom_emoji: custom_emoji).exists?
  end

  def emoji_reactioned?(status)
    status.proper.emoji_reactions.where(account: self).exists?
  end

  def bookmarked?(status)
    status.proper.bookmarks.where(account: self).exists?
  end

  def reblogged?(status)
    status.proper.reblogs.where(account: self).exists?
  end

  def pinned?(status)
    status_pins.where(status: status).exists?
  end

  def endorsed?(account)
    account_pins.where(target_account: account).exists?
  end

  def subscribing?(other_account, list_id = nil)
    active_subscribes.where(target_account: other_account, list_id: list_id).exists?
  end

  def followers_for_local_distribution
    delivery_followers.local
                      .joins(:user)
                      .where('users.current_sign_in_at > ?', User::ACTIVE_DURATION.ago)
  end

  def subscribers_for_local_distribution
    AccountSubscribe.home
                    .joins(account: :user)
                    .where(target_account_id: id)
                    .where('users.current_sign_in_at > ?', User::ACTIVE_DURATION.ago)
  end

  def lists_for_local_distribution
    lists.joins(account: :user)
         .where('users.current_sign_in_at > ?', User::ACTIVE_DURATION.ago)
  end

  def list_subscribers_for_local_distribution
    AccountSubscribe.list
                    .joins(account: :user)
                    .where(target_account_id: id)
                    .where('users.current_sign_in_at > ?', User::ACTIVE_DURATION.ago)
  end

  def remote_followers_hash(url)
    url_prefix = url[Account::URL_PREFIX_RE]
    return if url_prefix.blank?

    Rails.cache.fetch("followers_hash:#{id}:#{url_prefix}/") do
      digest = "\x00" * 32
      followers.where(Account.arel_table[:uri].matches("#{Account.sanitize_sql_like(url_prefix)}/%", false, true)).or(followers.where(uri: url_prefix)).pluck_each(:uri) do |uri|
        Xorcist.xor!(digest, Digest::SHA256.digest(uri))
      end
      digest.unpack('H*')[0]
    end
  end

  def local_followers_hash
    Rails.cache.fetch("followers_hash:#{id}:local") do
      digest = "\x00" * 32
      followers.where(domain: nil).pluck_each(:username) do |username|
        Xorcist.xor!(digest, Digest::SHA256.digest(ActivityPub::TagManager.instance.uri_for_username(username)))
      end
      digest.unpack('H*')[0]
    end
  end

  def mutuals
    followers.merge(Account.where(id: following))
  end

  private

  def remove_potential_friendship(other_account, mutual = false)
    PotentialFriendshipTracker.remove(id, other_account.id)
    PotentialFriendshipTracker.remove(other_account.id, id) if mutual
  end
end
