require Rails.root.join('lib', 'mastodon', 'migration_helpers')

class MigrationExpiredAtInStatuses < ActiveRecord::Migration[6.1]
  include Mastodon::MigrationHelpers

  disable_ddl_transaction!

  def up
    safety_assured do
      update_column_in_batches(:statuses, :expires_at, 'infinity') do |table, query|
        query.where(table[:expires_at].eq(nil))
      end
      change_column_null :statuses, :expires_at, false
    end
  end

  def down
    safety_assured do
      change_column_null :statuses, :expires_at, true
      update_column_in_batches(:statuses, :expires_at, nil) do |table, query|
        query.where(table[:expires_at].eq('infinity'))
      end
    end
  end
end
