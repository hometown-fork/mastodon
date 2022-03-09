class CreateKeywordSubscribes < ActiveRecord::Migration[5.2]
  def change
    create_table :keyword_subscribes do |t|
      t.references :account, foreign_key: { on_delete: :cascade }
      t.string :keyword, null: false
      t.boolean :ignorecase, default: true
      t.boolean :regexp, default: false

      t.timestamps
    end
  end
end
