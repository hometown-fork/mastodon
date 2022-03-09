# frozen_string_literal: true

class REST::DomainSubscribeSerializer < ActiveModel::Serializer
  attributes :id, :list_id, :domain, :updated_at

  def id
    object.id.to_s
  end
end
