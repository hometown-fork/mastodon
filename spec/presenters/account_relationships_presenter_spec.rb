# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AccountRelationshipsPresenter do
  describe '.initialize' do
    let!(:alice)                   { Fabricate(:account, username: 'alice') }
    let!(:bob)                     { Fabricate(:account, username: 'bob', domain: 'example.com') }
    let(:presenter)                { AccountRelationshipsPresenter.new(account_ids, current_account_id, **options) }
    let(:current_account_id)       { alice.id }
    let(:account_ids)              { [bob.id] }
    let(:empty_map)                { {} }
    let(:default_map)              { { bob.id => true } }
    let(:subscribing_default_map)  { { bob.id => { :"-1" => { :reblogs => true } } } }
    let(:account_note_default_map) { { bob.id => { :comment => 'comment' } } }

    context 'options are not set' do
      let(:options) { {} }

      it 'following set default maps' do
        alice.follow!(bob)
        expect(presenter.following).to eq default_map
        expect(presenter.showing_reblogs).to eq default_map
        expect(presenter.notifying).to eq empty_map
        expect(presenter.delivery_following).to eq default_map
      end

      it 'following set default maps and options to undefault value' do
        alice.follow!(bob, reblogs: false, notify: true, delivery: false)
        expect(presenter.following).to eq default_map
        expect(presenter.showing_reblogs).to eq empty_map
        expect(presenter.notifying).to eq default_map
        expect(presenter.delivery_following).to eq empty_map
      end

      it 'showing_reblogs set default maps' do
        alice.follow!(bob, reblogs: true)
        expect(presenter.showing_reblogs).to eq default_map
      end

      it 'notifying set default maps' do
        alice.follow!(bob, notify: true)
        expect(presenter.notifying).to eq default_map
      end

      it 'delivery_following set default maps' do
        alice.follow!(bob, delivery: true)
        expect(presenter.delivery_following).to eq default_map
      end

      it 'followed_by set default maps' do
        bob.follow!(alice)
        expect(presenter.followed_by).to eq default_map
      end

      it 'subscribing set default maps' do
        alice.subscribe!(bob)
        expect(presenter.subscribing).to eq subscribing_default_map
      end

      it 'blocking set default maps' do
        alice.block!(bob)
        expect(presenter.blocking).to eq default_map
      end

      it 'blocked_by set default maps' do
        bob.block!(alice)
        expect(presenter.blocked_by).to eq default_map
      end

      it 'muting set default maps' do
        alice.mute!(bob)
        expect(presenter.muting).to eq default_map
        expect(presenter.muting_notifications).to eq default_map
      end

      it 'muting set default maps and options to undefault value' do
        alice.mute!(bob, notifications: false)
        expect(presenter.muting).to eq default_map
        expect(presenter.muting_notifications).to eq empty_map
      end

      it 'muting_notifications set default maps' do
        alice.mute!(bob, notifications: true)
        expect(presenter.muting).to eq default_map
        expect(presenter.muting_notifications).to eq default_map
      end

      it 'requested set default maps' do
        alice.request_follow!(bob)
        expect(presenter.requested).to eq default_map
      end

      it 'requested showing_reblogs set default maps' do
        alice.request_follow!(bob, reblogs: true)
        expect(presenter.showing_reblogs).to eq default_map
      end

      it 'requested notifying set default maps' do
        alice.request_follow!(bob, notify: true)
        expect(presenter.notifying).to eq default_map
      end

      it 'requested delivery_following set default maps' do
        alice.request_follow!(bob, delivery: true)
        expect(presenter.delivery_following).to eq default_map
      end

      it 'domain_blocking set default maps' do
        alice.block_domain!('example.com')
        expect(presenter.domain_blocking).to eq default_map
      end

      it 'endorsed set default maps' do
        alice.follow!(bob)
        AccountPin.create!(account: alice, target_account: bob)
        expect(presenter.endorsed).to eq default_map
      end

      it 'account_note set default maps' do
        AccountNote.create!(account: alice, target_account: bob, comment: 'comment')
        expect(presenter.account_note).to eq account_note_default_map
      end

    end

    context 'options[:following_map] is set' do
      let(:options) { { following_map: { 1 => true } } }

      it 'sets @following merged with default_map and options[:following_map]' do
        alice.follow!(bob)
        expect(presenter.following).to eq default_map.merge(options[:following_map])
      end
    end

    context 'options[:showing_reblogs] is set' do
      let(:options) { { showing_reblogs_map: { 2 => true } } }

      it 'sets @showing_reblogs merged with default_map and options[:showing_reblogs_map]' do
        alice.follow!(bob, reblogs: true)
        expect(presenter.showing_reblogs).to eq default_map.merge(options[:showing_reblogs_map])
      end
    end

    context 'options[:notifying_map] is set' do
      let(:options) { { notifying_map: { 3 => true } } }

      it 'sets @notifying merged with default_map and options[:notifying_map]' do
        alice.follow!(bob, notify: true)
        expect(presenter.notifying).to eq default_map.merge(options[:notifying_map])
      end
    end

    context 'options[:delivery_following_map] is set' do
      let(:options) { { delivery_following_map: { 4 => true } } }

      it 'sets @delivery_following merged with default_map and options[:delivery_following_map]' do
        alice.follow!(bob, delivery: true)
        expect(presenter.delivery_following).to eq default_map.merge(options[:delivery_following_map])
      end
    end

    context 'options[:followed_by_map] is set' do
      let(:options) { { followed_by_map: { 5 => true } } }

      it 'sets @followed_by merged with default_map and options[:followed_by_map]' do
        bob.follow!(alice)
        expect(presenter.followed_by).to eq default_map.merge(options[:followed_by_map])
      end
    end

    context 'options[:subscribing_map] is set' do
      let(:options) { { subscribing_map: { 6 => { :"-1" => { :reblogs => true } } } } }

      it 'sets @subscribing merged with subscribing_default_map and options[:subscribing_map]' do
        alice.subscribe!(bob)
        expect(presenter.subscribing).to eq subscribing_default_map.merge(options[:subscribing_map])
      end
    end

    context 'options[:blocking_map] is set' do
      let(:options) { { blocking_map: { 7 => true } } }

      it 'sets @blocking merged with default_map and options[:blocking_map]' do
        alice.block!(bob)
        expect(presenter.blocking).to eq default_map.merge(options[:blocking_map])
      end
    end

    context 'options[:blocked_by_map] is set' do
      let(:options) { { blocked_by_map: { 8 => true } } }

      it 'sets @blocked_by merged with default_map and options[:blocked_by_map]' do
        bob.block!(alice)
        expect(presenter.blocked_by).to eq default_map.merge(options[:blocked_by_map])
      end
    end

    context 'options[:muting_map] is set' do
      let(:options) { { muting_map: { 9 => true } } }

      it 'sets @muting merged with default_map and options[:muting_map]' do
        alice.mute!(bob)
        expect(presenter.muting).to eq default_map.merge(options[:muting_map])
      end
    end

    context 'options[:muting_notifications_map] is set' do
      let(:options) { { muting_notifications_map: { 10 => true } } }

      it 'sets @muting_notifications merged with default_map and options[:muting_notifications_map]' do
        alice.mute!(bob, notifications: true)
        expect(presenter.muting_notifications).to eq default_map.merge(options[:muting_notifications_map])
      end
    end

    context 'options[:requested_map] is set' do
      let(:options) { { requested_map: { 11 => true } } }

      it 'sets @requested merged with default_map and options[:requested_map]' do
        alice.request_follow!(bob)
        expect(presenter.requested).to eq default_map.merge(options[:requested_map])
      end
    end

    context 'options[:domain_blocking_map] is set' do
      let(:options) { { domain_blocking_map: { 12 => true } } }

      it 'sets @domain_blocking merged with default_map and options[:domain_blocking_map]' do
        alice.block_domain!('example.com')
        expect(presenter.domain_blocking).to eq default_map.merge(options[:domain_blocking_map])
      end
    end

    context 'options[:endorsed_map] is set' do
      let(:options) { { endorsed_map: { 13 => true } } }

      it 'sets @endorsed merged with default_map and options[:endorsed_map]' do
        alice.follow!(bob)
        AccountPin.create!(account: alice, target_account: bob)
        expect(presenter.endorsed).to eq default_map.merge(options[:endorsed_map])
      end
    end

    context 'options[:account_note_map] is set' do
      let(:options) { { account_note_map: { 14 => { :comment => 'comment' } } } }

      it 'sets @account_note merged with account_note_default_map and options[:account_note_map]' do
        AccountNote.create!(account: alice, target_account: bob, comment: 'comment')
        expect(presenter.account_note).to eq account_note_default_map.merge(options[:account_note_map])
      end
    end
  end
end