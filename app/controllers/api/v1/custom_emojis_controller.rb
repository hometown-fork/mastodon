# frozen_string_literal: true

class Api::V1::CustomEmojisController < Api::BaseController
  skip_before_action :set_cache_headers
  skip_before_action :require_authenticated_user!, only: :index

  def index
    expires_in 3.minutes, public: true
    render_with_cache(each_serializer: REST::CustomEmojiSerializer) { CustomEmoji.listed.includes(:category) }
  end
end
