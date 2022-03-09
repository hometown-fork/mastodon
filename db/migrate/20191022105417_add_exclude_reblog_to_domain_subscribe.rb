class AddExcludeReblogToDomainSubscribe < ActiveRecord::Migration[5.2]
  def change
    add_column :domain_subscribes, :exclude_reblog, :boolean, default: true
  end
end
