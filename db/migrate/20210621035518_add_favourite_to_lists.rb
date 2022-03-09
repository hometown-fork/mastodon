require Rails.root.join('lib', 'mastodon', 'migration_helpers')

class AddFavouriteToLists < ActiveRecord::Migration[6.1]
  include Mastodon::MigrationHelpers

  disable_ddl_transaction!

  def up
    safety_assured { add_column_with_default :lists, :favourite, :boolean, default: false, allow_null: false }
  end

  def down
    remove_column :lists, :favourite
  end
end
