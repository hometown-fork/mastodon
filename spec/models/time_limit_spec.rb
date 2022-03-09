require 'rails_helper'

describe TimeLimit do
  describe '.from_tags' do
    it 'returns true' do
      tags = [
        Fabricate(:tag, name: "hoge"),
        Fabricate(:tag, name: "exp1m"),
        Fabricate(:tag, name: "fuga"),
        Fabricate(:tag, name: "exp10m"),
      ]
      result = TimeLimit.from_tags(tags)
      expect(result.to_duration).to eq(1.minute)
    end
  end

  describe '.from_status' do
    subject { TimeLimit.from_status(target_status)&.to_duration }

    let(:tag) { Fabricate(:tag, name: "exp1m") }
    let(:local_status) { Fabricate(:status, tags: [tag]) }
    let(:remote_status) { Fabricate(:status, tags: [tag], local: false, account: Fabricate(:account, domain: 'pawoo.net')) }

    context 'when status is local' do
      let(:target_status) { local_status }

      it { is_expected.to eq(1.minute) }
    end

    context 'when status is remote' do
      let(:target_status) { remote_status }

      it { is_expected.to be_nil }
    end

    context 'when status is reblog' do
      let(:target_status) {  Fabricate(:status, tags: [tag], reblog: reblog_target) }

      context 'reblog target is local status' do
        let(:reblog_target) { local_status }

        it { is_expected.to eq(1.minute) }
      end

      context 'when status is remote' do
        let(:reblog_target) { remote_status }

        it { is_expected.to be_nil }
      end
    end
  end

  describe '#valid?' do
    context 'valid tag_name' do
      it 'returns true' do
        result = TimeLimit.new('exp1m').valid?
        expect(result).to be true
      end
    end

    context 'invalid tag_name' do
      it 'returns false' do
        result = TimeLimit.new('10m').valid?
        expect(result).to be false
      end
      it 'returns false' do
        result = TimeLimit.new('exp10s').valid?
        expect(result).to be false
      end
    end

    context 'invalid time' do
      it 'returns false' do
        result = TimeLimit.new('exp431d').valid?
        expect(result).to be false
      end

      it 'returns false' do
        result = TimeLimit.new("exp#{24 * 431}h").valid?
        expect(result).to be false
      end
    end
  end

  describe '#to_duration' do
    context 'valid tag_name' do
      it 'returns positive numeric' do
        result = TimeLimit.new('exp1m').to_duration
        expect(result.positive?).to be true
      end
    end

    context 'invalid tag_name' do
      it 'returns 0' do
        result = TimeLimit.new('10m').to_duration
        expect(result).to be 0
      end
      it 'returns 0' do
        result = TimeLimit.new('exp10s').to_duration
        expect(result).to be 0
      end
    end
  end
end
