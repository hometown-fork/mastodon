class RemoveExcludeHomeFromKeywordSubscribes < ActiveRecord::Migration[5.2]
  def change
    safety_assured { remove_column :keyword_subscribes, :exclude_home, :boolean }
  end
end
