# frozen_string_literal: true

class REST::RelationshipSerializer < ActiveModel::Serializer
  attributes :id, :following, :delivery_following, :showing_reblogs, :notifying, :followed_by, :account_subscribing,
             :blocking, :blocked_by, :muting, :muting_notifications, :requested,
             :domain_blocking, :endorsed, :note

  def id
    object.id.to_s
  end

  def following
    instance_options[:relationships].following[object.id] ? true : false
  end

  def delivery_following
    instance_options[:relationships].delivery_following[object.id] ? true : false
  end

  def showing_reblogs
    instance_options[:relationships].showing_reblogs[object.id] ? true : false
  end

  def notifying
    instance_options[:relationships].notifying[object.id] ? true : false
  end

  def followed_by
    instance_options[:relationships].followed_by[object.id] || false
  end

  def account_subscribing
    instance_options[:relationships].subscribing[object.id] || {}
  end

  def blocking
    instance_options[:relationships].blocking[object.id] || false
  end

  def blocked_by
    instance_options[:relationships].blocked_by[object.id] || false
  end

  def muting
    instance_options[:relationships].muting[object.id] ? true : false
  end

  def muting_notifications
    instance_options[:relationships].muting_notifications[object.id] ? true : false
  end

  def requested
    instance_options[:relationships].requested[object.id] ? true : false
  end

  def domain_blocking
    instance_options[:relationships].domain_blocking[object.id] || false
  end

  def endorsed
    instance_options[:relationships].endorsed[object.id] || false
  end

  def note
    (instance_options[:relationships].account_note[object.id] || {})[:comment] || ''
  end
end
