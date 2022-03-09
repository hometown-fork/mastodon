class CreateFavouriteDomains < ActiveRecord::Migration[5.2]
  def change
    create_table :favourite_domains do |t|
      t.references :account, foreign_key: { on_delete: :cascade }
      t.string :name, null: false

      t.timestamps
    end
  end
end
