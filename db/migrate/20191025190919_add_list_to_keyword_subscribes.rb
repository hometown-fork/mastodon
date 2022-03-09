class AddListToKeywordSubscribes < ActiveRecord::Migration[5.2]
  disable_ddl_transaction!

  def change
    safety_assured { add_reference :keyword_subscribes, :list, foreign_key: { on_delete: :cascade }, index: false }
    add_index :keyword_subscribes, :list_id, algorithm: :concurrently
  end
end
