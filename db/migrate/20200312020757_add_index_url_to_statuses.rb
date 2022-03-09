# frozen_string_literal: true

class AddIndexURLToStatuses < ActiveRecord::Migration[5.2]
  disable_ddl_transaction!

  def change
    add_index :statuses, :url, algorithm: :concurrently
  end
end
