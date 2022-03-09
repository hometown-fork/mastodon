# frozen_string_literal: true

I18n.load_path += Dir[Rails.root.join('config', 'locales-fedibird', '*.{rb,yml}').to_s]
