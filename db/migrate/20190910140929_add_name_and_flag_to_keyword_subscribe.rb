class AddNameAndFlagToKeywordSubscribe < ActiveRecord::Migration[5.2]
  def change
    add_column :keyword_subscribes, :name, :string, default: '', null: false
    add_column :keyword_subscribes, :ignore_block, :boolean, default: false
    add_column :keyword_subscribes, :disabled, :boolean, default: false
    add_column :keyword_subscribes, :exclude_home, :boolean, default: false
  end
end
