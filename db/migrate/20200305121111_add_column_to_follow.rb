class AddColumnToFollow < ActiveRecord::Migration[5.2]
  def change
    add_column :follows, :delivery, :boolean, null: false, default: true
  end
end
