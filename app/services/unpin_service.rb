# frozen_string_literal: true

class UnpinService < BaseService
  def call(account, status)
    @account = account
    @status  = status

    return unless @account == @status.account

    pin = StatusPin.find_by(account: @account, status: @status)
  
    if pin
      pin.destroy!
      distribute_remove_activity! if @account.local?
    end
  end

  private

  def distribute_remove_activity!
    json = ActiveModelSerializers::SerializableResource.new(
      @status,
      serializer: ActivityPub::RemoveSerializer,
      adapter: ActivityPub::Adapter
    ).as_json

    ActivityPub::RawDistributionWorker.perform_async(Oj.dump(json), @account.id)
  end
end
