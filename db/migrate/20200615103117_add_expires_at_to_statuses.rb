class AddExpiresAtToStatuses < ActiveRecord::Migration[5.2]
  def change
    add_column :statuses, :expires_at, :datetime
  end
end
