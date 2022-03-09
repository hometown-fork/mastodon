require Rails.root.join('lib', 'mastodon', 'migration_helpers')

class AddEmojiReactionsJsonToStatusStat < ActiveRecord::Migration[6.1]
  include Mastodon::MigrationHelpers

  disable_ddl_transaction!

  def up
    safety_assured { add_column_with_default :status_stats, :emoji_reactions_cache, :string, default: '', allow_null: false }
  end

  def down
    remove_column :status_stats, :emoji_reactions_cache
  end
end
