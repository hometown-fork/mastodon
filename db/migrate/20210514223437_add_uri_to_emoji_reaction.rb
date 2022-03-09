class AddUriToEmojiReaction < ActiveRecord::Migration[6.1]
  def change
    add_column :emoji_reactions, :uri, :string
  end
end
