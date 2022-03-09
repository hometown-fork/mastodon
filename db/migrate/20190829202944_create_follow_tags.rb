class CreateFollowTags < ActiveRecord::Migration[5.2]
  def change
    create_table :follow_tags do |t|
      t.references :account, foreign_key: { on_delete: :cascade }
      t.references :tag, foreign_key: { on_delete: :cascade }

      t.timestamps
    end
  end
end
