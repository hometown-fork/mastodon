module ListsHelper
  def home_list_new(lists)
    items = { nil => t('column.home') }
    items.merge!(lists&.pluck(:id, :title).to_h)
    items.merge!({ -1 => t('lists.add_new') })
  end
end
