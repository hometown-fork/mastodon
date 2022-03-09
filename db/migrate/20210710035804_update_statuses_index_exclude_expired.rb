class UpdateStatusesIndexExcludeExpired < ActiveRecord::Migration[6.1]
  disable_ddl_transaction!

  def up
    safety_assured { add_index :statuses, [:account_id, :id, :visibility, :updated_at], where: 'deleted_at IS NULL', order: { id: :desc }, algorithm: :concurrently, name: :index_statuses_20210710 }
    remove_index :statuses, name: :index_statuses_20210627
  end

  def down
    safety_assured { add_index :statuses, [:account_id, :id, :visibility, :updated_at, :expires_at], where: 'deleted_at IS NULL', order: { id: :desc }, algorithm: :concurrently, name: :index_statuses_20210627 }
    remove_index :statuses, name: :index_statuses_20210710
  end
end
