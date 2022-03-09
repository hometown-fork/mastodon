class AddListToFollowTags < ActiveRecord::Migration[5.2]
  disable_ddl_transaction!

  def change
    safety_assured { add_reference :follow_tags, :list, foreign_key: { on_delete: :cascade }, index: false }
    add_index :follow_tags, :list_id, algorithm: :concurrently
  end
end
