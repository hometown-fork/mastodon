# frozen_string_literal: true

class Api::V1::ListsController < Api::BaseController
  before_action -> { doorkeeper_authorize! :read, :'read:lists' }, only: [:index, :show]
  before_action -> { doorkeeper_authorize! :write, :'write:lists' }, except: [:index, :show]

  before_action :require_user!
  before_action :set_list, except: [:index, :create]

  def index
    @lists = load_lists.all
    render json: @lists, each_serializer: REST::ListSerializer
  end

  def load_lists
    if list_params[:favourite]
      List.where(account: current_account).where(favourite: true)
    else
      List.where(account: current_account)
    end
  end

  def show
    render json: @list, serializer: REST::ListSerializer
  end

  def create
    @list = List.create!(list_params.merge(account: current_account))
    render json: @list, serializer: REST::ListSerializer
  end

  def update
    @list.update!(list_params)
    render json: @list, serializer: REST::ListSerializer
  end

  def destroy
    @list.destroy!
    render_empty
  end

  def favourite
    @list.favourite!
    render json: @list, serializer: REST::ListSerializer
  end

  def unfavourite
    @list.unfavourite!
    render json: @list, serializer: REST::ListSerializer
  end

  private

  def set_list
    @list = List.where(account: current_account).find(params[:id])
  end

  def list_params
    params.permit(:title, :replies_policy, :is_exclusive, :favourite)
  end
end
