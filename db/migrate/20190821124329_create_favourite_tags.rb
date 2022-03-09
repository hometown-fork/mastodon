class CreateFavouriteTags < ActiveRecord::Migration[5.2]
  def change
    create_table :favourite_tags do |t|
      t.references :account, foreign_key: { on_delete: :cascade }
      t.references :tag, foreign_key: { on_delete: :cascade }

      t.timestamps
    end
  end
end
