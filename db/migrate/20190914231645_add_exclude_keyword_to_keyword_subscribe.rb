class AddExcludeKeywordToKeywordSubscribe < ActiveRecord::Migration[5.2]
  def change
    add_column :keyword_subscribes, :exclude_keyword, :string, default: '', null: false
  end
end
