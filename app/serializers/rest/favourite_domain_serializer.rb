# frozen_string_literal: true

class REST::FavouriteDomainSerializer < ActiveModel::Serializer
  attributes :id, :name, :updated_at

  def id
    object.id.to_s
  end
end
