class ChangeStatusAndAccountOnEmojiReactionToNonnullable < ActiveRecord::Migration[6.1]
  def change
    safety_assured do
      change_column_null :emoji_reactions, :account_id, false
      change_column_null :emoji_reactions, :status_id, false
    end
  end
end
