# frozen_string_literal: true

class PinService < BaseService
  def call(account, status)
    @account = account
    @status  = status

    return unless @account == @status.account

    StatusPin.create!(account: @account, status: @status)
    distribute_add_activity! if @account.local?
  end

  private

  def distribute_add_activity!
    json = ActiveModelSerializers::SerializableResource.new(
      @status,
      serializer: ActivityPub::AddSerializer,
      adapter: ActivityPub::Adapter
    ).as_json

    ActivityPub::RawDistributionWorker.perform_async(Oj.dump(json), @account.id)
  end
end

