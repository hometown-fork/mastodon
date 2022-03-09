require Rails.root.join('lib', 'mastodon', 'migration_helpers')

class AddExpiredAtToStatus < ActiveRecord::Migration[6.1]
  include Mastodon::MigrationHelpers

  disable_ddl_transaction!

  def up
    safety_assured { add_column :statuses, :expired_at, :datetime, default: nil, allow_null: true }
    safety_assured { add_index :statuses, :expired_at, algorithm: :concurrently, name: :index_statuses_on_expired_at }
  end

  def down
    remove_index :statuses, name: :index_statuses_on_expired_at
    remove_column :statuses, :expired_at
  end
end
