require Rails.root.join('lib', 'mastodon', 'migration_helpers')

class AddShowReblogsToAccountSubscribe < ActiveRecord::Migration[5.2]
  include Mastodon::MigrationHelpers

  disable_ddl_transaction!

  def up
    safety_assured do
      add_column_with_default :account_subscribes, :show_reblogs, :boolean, default: true, allow_null: false
    end
  end

  def down
    remove_column :account_subscribes, :show_reblogs
  end
end
