class AddSubscribingCountToAccountStat < ActiveRecord::Migration[5.2]
  def change
    add_column :account_stats, :subscribing_count, :bigint, null: false, default: 0
  end
end
