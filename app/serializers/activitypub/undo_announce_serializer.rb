# frozen_string_literal: true

class ActivityPub::UndoAnnounceSerializer < ActivityPub::Serializer
  attributes :id, :type, :actor, :to
  attribute :expiry, if: -> { expiry? }

  has_one :virtual_object, key: :object, serializer: ActivityPub::ActivitySerializer

  def id
    [ActivityPub::TagManager.instance.uri_for(object.account), '#announces/', object.id, '/undo'].join
  end

  def type
    'Undo'
  end

  def actor
    ActivityPub::TagManager.instance.uri_for(object.account)
  end

  def to
    [ActivityPub::TagManager::COLLECTIONS[:public]]
  end

  def virtual_object
    ActivityPub::ActivityPresenter.from_status(object)
  end

  def expiry?
    instance_options && instance_options[:expiry].present?
  end

  def expiry
    instance_options[:expiry].expiry.iso8601
  end
end
