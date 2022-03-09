class CreateStatusExpires < ActiveRecord::Migration[6.1]
  def change
    create_table :status_expires do |t|
      t.references :status, null: false, foreign_key: { on_delete: :cascade }, index: { unique: true }
      t.datetime :expires_at, null: false, index: true
      t.integer :action, default: 0, null: false

      t.timestamps
    end
  end
end
