class CreateAccountSubscribes < ActiveRecord::Migration[5.2]
  def change
    create_table :account_subscribes do |t|
      t.references :account, foreign_key: { on_delete: :cascade }
      t.references :target_account, foreign_key: { to_table: 'accounts', on_delete: :cascade }

      t.timestamps
    end
  end
end
