# frozen_string_literal: true

class InitialStateSerializer < ActiveModel::Serializer
  attributes :meta, :compose, :accounts, :lists,
             :media_attachments, :settings,
             :max_toot_chars

  has_one :push_subscription, serializer: REST::WebPushSubscriptionSerializer

  def max_toot_chars
    StatusLengthValidator::MAX_CHARS
  end

  def meta
    store = {
      streaming_api_base_url: Rails.configuration.x.streaming_api_base_url,
      access_token: object.token,
      locale: I18n.locale,
      domain: Rails.configuration.x.local_domain,
      title: instance_presenter.site_title,
      admin: object.admin&.id&.to_s,
      search_enabled: Chewy.enabled?,
      repository: Mastodon::Version.repository,
      source_url: Mastodon::Version.source_url,
      version: Mastodon::Version.to_s,
      invites_enabled: Setting.min_invite_role == 'user',
      limited_federation_mode: Rails.configuration.x.whitelist_mode,
      mascot: instance_presenter.mascot&.file&.url,
      profile_directory: Setting.profile_directory,
      trends: Setting.trends,
    }

    if object.current_account
      store[:me]                                = object.current_account.id.to_s
      store[:unfollow_modal]                    = object.current_account.user.setting_unfollow_modal
      store[:unsubscribe_modal]                 = object.current_account.user.setting_unsubscribe_modal
      store[:boost_modal]                       = object.current_account.user.setting_boost_modal
      store[:delete_modal]                      = object.current_account.user.setting_delete_modal
      store[:auto_play_gif]                     = object.current_account.user.setting_auto_play_gif
      store[:display_media]                     = object.current_account.user.setting_display_media
      store[:expand_spoilers]                   = object.current_account.user.setting_expand_spoilers
      store[:reduce_motion]                     = object.current_account.user.setting_reduce_motion
      store[:disable_swiping]                   = object.current_account.user.setting_disable_swiping
      store[:advanced_layout]                   = object.current_account.user.setting_advanced_layout
      store[:use_blurhash]                      = object.current_account.user.setting_use_blurhash
      store[:use_pending_items]                 = object.current_account.user.setting_use_pending_items
      store[:is_staff]                          = object.current_account.user.staff?
      store[:trends]                            = Setting.trends && object.current_account.user.setting_trends
      store[:crop_images]                       = object.current_account.user.setting_crop_images
      store[:show_follow_button_on_timeline]    = object.current_account.user.setting_show_follow_button_on_timeline
      store[:show_subscribe_button_on_timeline] = object.current_account.user.setting_show_subscribe_button_on_timeline
      store[:show_followed_by]                  = object.current_account.user.setting_show_followed_by
      store[:follow_button_to_list_adder]       = object.current_account.user.setting_follow_button_to_list_adder
      store[:show_navigation_panel]             = object.current_account.user.setting_show_navigation_panel
      store[:show_quote_button]                 = object.current_account.user.setting_show_quote_button
      store[:show_bookmark_button]              = object.current_account.user.setting_show_bookmark_button
      store[:show_target]                       = object.current_account.user.setting_show_target
      store[:place_tab_bar_at_bottom]           = object.current_account.user.setting_place_tab_bar_at_bottom
      store[:show_tab_bar_label]                = object.current_account.user.setting_show_tab_bar_label
      store[:enable_limited_timeline]           = object.current_account.user.setting_enable_limited_timeline
      store[:enable_reaction]                   = object.current_account.user.setting_enable_reaction
      store[:show_reply_tree_button]            = object.current_account.user.setting_show_reply_tree_button
    else
      store[:auto_play_gif] = Setting.auto_play_gif
      store[:display_media] = Setting.display_media
      store[:reduce_motion] = Setting.reduce_motion
      store[:use_blurhash]  = Setting.use_blurhash
      store[:crop_images]   = Setting.crop_images
    end

    store
  end

  def compose
    store = {}

    if object.current_account
      store[:me]                = object.current_account.id.to_s
      store[:default_privacy]   = object.visibility || object.current_account.user.setting_default_privacy
      store[:default_sensitive] = object.current_account.user.setting_default_sensitive
      store[:default_federation] = object.current_account.user.setting_default_federation
    end

    store[:text] = object.text if object.text

    store
  end

  def accounts
    store = {}
    store[object.current_account.id.to_s] = ActiveModelSerializers::SerializableResource.new(object.current_account, serializer: REST::AccountSerializer) if object.current_account
    store[object.admin.id.to_s]           = ActiveModelSerializers::SerializableResource.new(object.admin, serializer: REST::AccountSerializer) if object.admin
    store
  end

  def lists
    store = ActiveModelSerializers::SerializableResource.new(object.current_account.owned_lists, each_serializer: REST::ListSerializer) if object.current_account
    store
  end

  def media_attachments
    { accept_content_types: MediaAttachment.supported_file_extensions + MediaAttachment.supported_mime_types }
  end

  private

  def instance_presenter
    @instance_presenter ||= InstancePresenter.new
  end
end
