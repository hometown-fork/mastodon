require Rails.root.join('lib', 'mastodon', 'migration_helpers')

class FixExpiredAtInStatusesNullToInfinity < ActiveRecord::Migration[6.1]
  include Mastodon::MigrationHelpers

  disable_ddl_transaction!

  def up
    safety_assured do
      change_column_default :statuses, :expires_at, 'infinity'
    end
  end

  def down
    safety_assured do
      change_column_default :statuses, :expires_at, nil
    end
  end
end
