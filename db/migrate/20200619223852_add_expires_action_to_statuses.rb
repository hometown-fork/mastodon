class AddExpiresActionToStatuses < ActiveRecord::Migration[5.2]
  def change
    add_column :statuses, :expires_action, :integer, default: 0, null: false
  end
end
