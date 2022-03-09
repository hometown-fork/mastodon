class MigrateToNormalizeExpires < ActiveRecord::Migration[6.1]
  def change
    def up
      safety_assured do
        execute 'insert into status_expires (status_id, expires_at, action, created_at, updated_at) select id as status_id, expires_at, expires_action as action, created_at, updated_at from statuses where expires_at is not null and expires_at != \'infinity\';'
        remove_column :statuses, :expires_at
        remove_column :statuses, :expires_action
      end
    end
  
    def down
      safety_assured do
        add_column :statuses, :expires_at, :datetime
        add_column :statuses, :expires_action, :integer, default: 0, null: false
        execute 'update statuses set expires_at = se.expires_at, expires_action = se.action from status_expires se;'
      end
    end
  end
end
