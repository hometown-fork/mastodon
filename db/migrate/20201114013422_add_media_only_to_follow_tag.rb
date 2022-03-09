require Rails.root.join('lib', 'mastodon', 'migration_helpers')

class AddMediaOnlyToFollowTag < ActiveRecord::Migration[5.2]
  include Mastodon::MigrationHelpers

  disable_ddl_transaction!

  def up
    safety_assured do
      add_column_with_default :follow_tags, :media_only, :boolean, default: false, allow_null: false
    end
  end

  def down
    remove_column :follow_tags, :media_only
  end
end
