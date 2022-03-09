# == Schema Information
#
# Table name: keyword_subscribes
#
#  id              :bigint(8)        not null, primary key
#  account_id      :bigint(8)
#  keyword         :string           not null
#  ignorecase      :boolean          default(TRUE)
#  regexp          :boolean          default(FALSE)
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  name            :string           default(""), not null
#  ignore_block    :boolean          default(FALSE)
#  disabled        :boolean          default(FALSE)
#  exclude_keyword :string           default(""), not null
#  list_id         :bigint(8)
#  media_only      :boolean          default(FALSE), not null
#

class KeywordSubscribe < ApplicationRecord
  belongs_to :account, inverse_of: :keyword_subscribes, required: true
  belongs_to :list, optional: true

  validates :keyword, presence: true
  validate :validate_subscribes_limit, on: :create
  validate :validate_keyword_regexp_syntax
  validate :validate_exclude_keyword_regexp_syntax
  validate :validate_uniqueness_in_account, on: :create

  scope :active, -> { where(disabled: false) }
  scope :ignore_block, -> { where(ignore_block: true) }
  scope :home, -> { where(list_id: nil) }
  scope :list, -> { where.not(list_id: nil) }
  scope :without_local_followed_home, ->(account) { home.where.not(account: account.delivery_followers.local) }
  scope :without_local_followed_list, ->(account) { list.where.not(list_id: ListAccount.followed_lists(account)) }
  scope :with_media, ->(status) { where(media_only: false) unless status.with_media? }

  def keyword=(val)
    super(regexp ? val : keyword_normalization(val))
  end

  def exclude_keyword=(val)
    super(regexp ? val : keyword_normalization(val))
  end

  def match?(text)
    keyword_regexp.match?(text) && (exclude_keyword.empty? || !exclude_keyword_regexp.match?(text))
  end

  def keyword_regexp
    to_regexp keyword
  end

  def exclude_keyword_regexp
    to_regexp exclude_keyword
  end

  class << self
    def match?(text, account_id: account_id = nil, as_ignore_block: as_ignore_block = false)
      target = KeywordSubscribe.active
      target = target.where(account_id: account_id) if account_id.present?
      target = target.ignore_block                  if as_ignore_block
      !target.find{ |t| t.match?(text) }.nil?
    end
  end

  private

  def keyword_normalization(val)
    val.to_s.strip.gsub(/\s{2,}/, ' ').split(/\s*,\s*/).reject(&:blank?).uniq.join(',')
  end

  def to_regexp(words)
    Regexp.new(regexp ? words : "(?<![#])(#{words.split(',').map do |k|
      sb = k =~ /\A[A-Za-z0-9]/ ? '\b' : k !~ /\A[\/\.]/ ? '(?<![\/\.])' : ''
      eb = k =~ /[A-Za-z0-9]\z/ ? '\b' : k !~ /[\/\.]\z/ ? '(?![\/\.])' : ''

      /(?m#{ignorecase ? 'i': ''}x:#{sb}#{Regexp.quote(k).gsub("\\ ", "[[:space:]]+")}#{eb})/
    end.join('|')})", ignorecase)
  end

  def validate_keyword_regexp_syntax
    return unless regexp

    begin
      Regexp.compile(keyword, ignorecase)
    rescue RegexpError => exception
      errors.add(:base, I18n.t('keyword_subscribes.errors.regexp', message: exception.message))
    end
  end

  def validate_exclude_keyword_regexp_syntax
    return unless regexp

    begin
      Regexp.compile(exclude_keyword, ignorecase)
    rescue RegexpError => exception
      errors.add(:base, I18n.t('keyword_subscribes.errors.regexp', message: exception.message))
    end
  end

  def validate_subscribes_limit
    errors.add(:base, I18n.t('keyword_subscribes.errors.limit')) if account.keyword_subscribes.count >= 100
  end

  def validate_uniqueness_in_account
    errors.add(:base, I18n.t('keyword_subscribes.errors.duplicate')) if account.keyword_subscribes.find_by(keyword: keyword, exclude_keyword: exclude_keyword, list_id: list_id)
  end
end
