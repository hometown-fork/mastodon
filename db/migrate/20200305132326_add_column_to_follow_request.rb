class AddColumnToFollowRequest < ActiveRecord::Migration[5.2]
  def change
    add_column :follow_requests, :delivery, :boolean, null: false, default: true
  end
end
