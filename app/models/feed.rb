# frozen_string_literal: true

class Feed
  include Redisable

  def initialize(type, id)
    @type = type
    @id   = id
  end

  def get(limit, max_id = nil, since_id = nil, min_id = nil, visibilities = [])
    limit    = limit.to_i
    max_id   = max_id.to_i if max_id.present?
    since_id = since_id.to_i if since_id.present?
    min_id   = min_id.to_i if min_id.present?

    from_redis(limit, max_id, since_id, min_id, visibilities)
  end

  protected

  def from_redis(limit, max_id, since_id, min_id, visibilities)
    max_id = '+inf' if max_id.blank?
    if min_id.blank?
      since_id   = '-inf' if since_id.blank?
      unhydrated = redis.zrevrangebyscore(key, "(#{max_id}", "(#{since_id}", limit: [0, visibilities.empty? ? limit : FeedManager::MAX_ITEMS], with_scores: true).map(&:first).map(&:to_i)
    else
      unhydrated = redis.zrangebyscore(key, "(#{min_id}", "(#{max_id}", limit: [0, visibilities.empty? ? limit : FeedManager::MAX_ITEMS], with_scores: true).map(&:first).map(&:to_i)
    end

    statuses = Status.where(id: unhydrated)
    statuses = statuses.where(visibility: visibilities).limit(limit) unless visibilities.empty?
    statuses.cache_ids
  end

  def key
    FeedManager.instance.key(@type, @id)
  end
end
