class CreateDomainSubscribes < ActiveRecord::Migration[5.2]
  def change
    create_table :domain_subscribes do |t|
      t.references :account, foreign_key: { on_delete: :cascade }
      t.references :list, foreign_key: { on_delete: :cascade }
      t.string :domain, default: '', null: false

      t.timestamps
    end
  end
end
