# frozen_string_literal: true

class REST::AccountSubscribeSerializer < ActiveModel::Serializer
  attributes :id, :target_account, :updated_at

  def id
    object.id.to_s
  end
end
