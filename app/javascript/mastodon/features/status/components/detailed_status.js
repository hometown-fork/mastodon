import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import Avatar from '../../../components/avatar';
import DisplayName from '../../../components/display_name';
import StatusContent from '../../../components/status_content';
import MediaGallery from '../../../components/media_gallery';
import { Link } from 'react-router-dom';
import { injectIntl, defineMessages, FormattedDate, FormattedMessage } from 'react-intl';
import Card from './card';
import ImmutablePureComponent from 'react-immutable-pure-component';
import Video from '../../video';
import Audio from '../../audio';
import scheduleIdleTask from '../../ui/util/schedule_idle_task';
import classNames from 'classnames';
import Icon from 'mastodon/components/icon';
import AnimatedNumber from 'mastodon/components/animated_number';
import EmojiReactionsBar from 'mastodon/components/emoji_reactions_bar';
import PictureInPicturePlaceholder from 'mastodon/components/picture_in_picture_placeholder';
import { enableReaction } from 'mastodon/initial_state';

const messages = defineMessages({
  public_short: { id: 'privacy.public.short', defaultMessage: 'Public' },
  unlisted_short: { id: 'privacy.unlisted.short', defaultMessage: 'Unlisted' },
  private_short: { id: 'privacy.private.short', defaultMessage: 'Followers-only' },
  mutual_short: { id: 'privacy.mutual.short', defaultMessage: 'Mutual-followers-only' },
  limited_short: { id: 'privacy.limited.short', defaultMessage: 'Circle' },
  direct_short: { id: 'privacy.direct.short', defaultMessage: 'Direct' },
  local_only: { id: 'status.local_only', defaultMessage: 'This post is only visible by other users of your instance' },
});

const mapStateToProps = (state, props) => {
  let status = props.status;

  if (status === null) {
    return null;
  }

  if (status.get('reblog', null) !== null && typeof status.get('reblog') === 'object') {
    status = status.get('reblog');
  }

  if (status.get('quote', null) === null) {
    return {
      quote_muted: status.get('quote_id', null) ? true : false,
    };
  }
  const id = status.getIn(['quote', 'account', 'id'], null);

  return {
    quote_muted: id !== null && (state.getIn(['relationships', id, 'muting']) || state.getIn(['relationships', id, 'blocking']) || state.getIn(['relationships', id, 'blocked_by']) || state.getIn(['relationships', id, 'domain_blocking'])) || status.getIn(['quote', 'quote_muted']),
  };
};

const dateFormatOptions = {
  hour12: false,
  year: 'numeric',
  month: 'short',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
};

export default @connect(mapStateToProps)
@injectIntl
class DetailedStatus extends ImmutablePureComponent {

  static contextTypes = {
    router: PropTypes.object,
  };

  static propTypes = {
    status: ImmutablePropTypes.map,
    quote_muted: PropTypes.bool,
    onOpenMedia: PropTypes.func.isRequired,
    onOpenVideo: PropTypes.func.isRequired,
    onOpenMediaQuote: PropTypes.func.isRequired,
    onOpenVideoQuote: PropTypes.func.isRequired,
    onToggleHidden: PropTypes.func.isRequired,
    measureHeight: PropTypes.bool,
    onHeightChange: PropTypes.func,
    domain: PropTypes.string.isRequired,
    compact: PropTypes.bool,
    showMedia: PropTypes.bool,
    pictureInPicture: ImmutablePropTypes.contains({
      inUse: PropTypes.bool,
      available: PropTypes.bool,
    }),
    onToggleMediaVisibility: PropTypes.func,
    onQuoteToggleHidden: PropTypes.func.isRequired,
    showQuoteMedia: PropTypes.bool,
    onToggleQuoteMediaVisibility: PropTypes.func,
    emojiMap: ImmutablePropTypes.map,
    addEmojiReaction: PropTypes.func.isRequired,
    removeEmojiReaction: PropTypes.func.isRequired,
  };

  state = {
    height: null,
  };

  handleAccountClick = (e) => {
    if (e.button === 0 && !(e.ctrlKey || e.metaKey) && this.context.router) {
      const id = e.currentTarget.getAttribute('data-id');
      const group = e.currentTarget.getAttribute('data-group') !== 'false';

      e.preventDefault();
      if (group) {
        this.context.router.history.push(`/timelines/groups/${id}`);
      } else {
        this.context.router.history.push(`/accounts/${id}`);
      }
    }

    e.stopPropagation();
  }

  handleOpenVideo = (options) => {
    this.props.onOpenVideo(this.props.status.getIn(['media_attachments', 0]), options);
  }

  handleOpenVideoQuote = (options) => {
    this.props.onOpenVideoQuote(this.props.status.getIn(['quote', 'media_attachments', 0]), options);
  }

  handleExpandedToggle = () => {
    this.props.onToggleHidden(this.props.status);
  }

  _measureHeight (heightJustChanged) {
    if (this.props.measureHeight && this.node) {
      scheduleIdleTask(() => this.node && this.setState({ height: Math.ceil(this.node.scrollHeight) + 1 }));

      if (this.props.onHeightChange && heightJustChanged) {
        this.props.onHeightChange();
      }
    }
  }

  setRef = c => {
    this.node = c;
    this._measureHeight();
  }

  componentDidUpdate (prevProps, prevState) {
    this._measureHeight(prevState.height !== this.state.height);
  }

  handleModalLink = e => {
    e.preventDefault();

    let href;

    if (e.target.nodeName !== 'A') {
      href = e.target.parentNode.href;
    } else {
      href = e.target.href;
    }

    window.open(href, 'mastodon-intent', 'width=445,height=600,resizable=no,menubar=no,status=no,scrollbars=yes');
  }

  handleExpandedQuoteToggle = () => {
    this.props.onQuoteToggleHidden(this.props.status);
  }

  handleQuoteClick = () => {
    if (!this.context.router) {
      return;
    }

    const { status } = this.props;
    this.context.router.history.push(`/statuses/${status.getIn(['quote', 'id'])}`);
  }

  render () {
    const status = (this.props.status && this.props.status.get('reblog')) ? this.props.status.get('reblog') : this.props.status;
    const quote_muted = this.props.quote_muted
    const outerStyle = { boxSizing: 'border-box' };
    const { intl, compact, pictureInPicture } = this.props;

    if (!status) {
      return null;
    }

    let media           = '';
    let applicationLink = '';
    let reblogLink = '';
    let localOnly = '';
    let reblogIcon = 'retweet';
    let favouriteLink = '';
    let emojiReactionLink = '';

    const reblogsCount = status.get('reblogs_count');
    const favouritesCount = status.get('favourites_count');
    const emojiReactionsCount = status.get('emoji_reactions').reduce( (accumulator, reaction) => accumulator + reaction.get('count'), 0 );

    if (this.props.measureHeight) {
      outerStyle.height = `${this.state.height}px`;
    }

    let quote = null;
    if (status.get('quote', null) !== null) {
      let quote_status = status.get('quote');

      let quote_media = null;
      if (quote_status.get('media_attachments').size > 0) {

        if (quote_status.getIn(['media_attachments', 0, 'type']) === 'audio') {
          const attachment = quote_status.getIn(['media_attachments', 0]);

          quote_media = (
            <Audio
              src={attachment.get('url')}
              alt={attachment.get('description')}
              duration={attachment.getIn(['meta', 'original', 'duration'], 0)}
              poster={attachment.get('preview_url') || quote_status.getIn(['account', 'avatar_static'])}
              backgroundColor={attachment.getIn(['meta', 'colors', 'background'])}
              foregroundColor={attachment.getIn(['meta', 'colors', 'foreground'])}
              accentColor={attachment.getIn(['meta', 'colors', 'accent'])}
              height={60}
            />
          );
        } else if (quote_status.getIn(['media_attachments', 0, 'type']) === 'video') {
          const attachment = quote_status.getIn(['media_attachments', 0]);

          quote_media = (
            <Video
              preview={attachment.get('preview_url')}
              frameRate={attachment.getIn(['meta', 'original', 'frame_rate'])}
              blurhash={attachment.get('blurhash')}
              src={attachment.get('url')}
              alt={attachment.get('description')}
              width={300}
              height={150}
              inline
              onOpenVideo={this.handleOpenVideoQuote}
              sensitive={quote_status.get('sensitive')}
              visible={this.props.showQuoteMedia}
              onToggleVisibility={this.props.onToggleQuoteMediaVisibility}
              quote
            />
          );
        } else {
          quote_media = (
            <MediaGallery
              standalone
              sensitive={quote_status.get('sensitive')}
              media={quote_status.get('media_attachments')}
              height={300}
              onOpenMedia={this.props.onOpenMediaQuote}
              visible={this.props.showQuoteMedia}
              onToggleVisibility={this.props.onToggleQuoteMediaVisibility}
              quote
            />
          );
        }
      }

      if (quote_muted) {
        quote = (
          <div className='quote-status' data-id={quote_status.get('id')} dataurl={quote_status.get('url')}>
            <div className='status__content muted-quote'>
              <FormattedMessage id='status.muted_quote' defaultMessage='Muted quote' />
            </div>
          </div>
        );
      } else {
        quote = (
          <div className='quote-status' data-id={quote_status.get('id')} dataurl={quote_status.get('url')}>
            <a href={quote_status.getIn(['account', 'url'])} onClick={this.handleAccountClick} data-id={quote_status.getIn(['account', 'id'])} data-group={quote_status.getIn(['account', 'group'])} className='detailed-status__display-name'>
              <div className='detailed-status__display-avatar'><Avatar account={quote_status.get('account')} size={18} /></div>
              <DisplayName account={quote_status.get('account')} localDomain={this.props.domain} />
            </a>

            <StatusContent status={quote_status} onClick={this.handleQuoteClick} expanded={!status.get('quote_hidden')} onExpandedToggle={this.handleExpandedQuoteToggle} quote />
            {quote_media}
          </div>
        );
      }
    } else if (quote_muted) {
      quote = (
        <div className={classNames('quote-status', { muted: this.props.muted })}>
          <div className={classNames('status__content muted-quote', { 'status__content--with-action': this.context.router })}>
            <FormattedMessage id='status.muted_quote' defaultMessage='Muted quote' />
          </div>
        </div>
      );
    }

    if (pictureInPicture.get('inUse')) {
      media = <PictureInPicturePlaceholder />;
    } else if (status.get('media_attachments').size > 0) {
      if (status.getIn(['media_attachments', 0, 'type']) === 'audio') {
        const attachment = status.getIn(['media_attachments', 0]);

        media = (
          <Audio
            src={attachment.get('url')}
            alt={attachment.get('description')}
            duration={attachment.getIn(['meta', 'original', 'duration'], 0)}
            poster={attachment.get('preview_url') || status.getIn(['account', 'avatar_static'])}
            backgroundColor={attachment.getIn(['meta', 'colors', 'background'])}
            foregroundColor={attachment.getIn(['meta', 'colors', 'foreground'])}
            accentColor={attachment.getIn(['meta', 'colors', 'accent'])}
            height={150}
          />
        );
      } else if (status.getIn(['media_attachments', 0, 'type']) === 'video') {
        const attachment = status.getIn(['media_attachments', 0]);

        media = (
          <Video
            preview={attachment.get('preview_url')}
            frameRate={attachment.getIn(['meta', 'original', 'frame_rate'])}
            blurhash={attachment.get('blurhash')}
            src={attachment.get('url')}
            alt={attachment.get('description')}
            width={300}
            height={150}
            inline
            onOpenVideo={this.handleOpenVideo}
            sensitive={status.get('sensitive')}
            visible={this.props.showMedia}
            onToggleVisibility={this.props.onToggleMediaVisibility}
          />
        );
      } else {
        media = (
          <MediaGallery
            standalone
            sensitive={status.get('sensitive')}
            media={status.get('media_attachments')}
            height={300}
            onOpenMedia={this.props.onOpenMedia}
            visible={this.props.showMedia}
            onToggleVisibility={this.props.onToggleMediaVisibility}
          />
        );
      }
    } else if (status.get('spoiler_text').length === 0) {
      media = <Card sensitive={status.get('sensitive')} onOpenMedia={this.props.onOpenMedia} card={status.get('card', null)} />;
    }

    if (status.get('application')) {
      applicationLink = <Fragment> · <a className='detailed-status__application' href={status.getIn(['application', 'website'])} target='_blank' rel='noopener noreferrer'>{status.getIn(['application', 'name'])}</a></Fragment>;
    }

    const visibilityIconInfo = {
      'public': { icon: 'globe', text: intl.formatMessage(messages.public_short) },
      'unlisted': { icon: 'unlock', text: intl.formatMessage(messages.unlisted_short) },
      'private': { icon: 'lock', text: intl.formatMessage(messages.private_short) },
      'mutual': { icon: 'exchange', text: intl.formatMessage(messages.mutual_short) },
      'limited': { icon: 'user-circle', text: intl.formatMessage(messages.limited_short) },
      'direct': { icon: 'envelope', text: intl.formatMessage(messages.direct_short) },
    };

    const visibilityIcon = visibilityIconInfo[status.get('visibility')];
    const visibilityLink = <Fragment> · <Icon id={visibilityIcon.icon} title={visibilityIcon.text} /></Fragment>;

    if (!(['public', 'unlisted'].includes(status.get('visibility')))) {
      reblogLink = '';
    } else if (this.context.router) {
      reblogLink = (
        <Fragment>
          <Fragment> · </Fragment>
          <Link to={`/statuses/${status.get('id')}/reblogs`} className='detailed-status__link'>
            <Icon id={reblogIcon} />
            <span className='detailed-status__reblogs'>
              <AnimatedNumber value={reblogsCount} />
            </span>
          </Link>
        </Fragment>
      );
    } else {
      reblogLink = (
        <Fragment>
          <Fragment> · </Fragment>
          <a href={`/interact/${status.get('id')}?type=reblog`} className='detailed-status__link' onClick={this.handleModalLink}>
            <Icon id={reblogIcon} />
            <span className='detailed-status__reblogs'>
              <AnimatedNumber value={reblogsCount} />
            </span>
          </a>
        </Fragment>
      );
    }

    if(status.get('local_only')) {
      localOnly = <span> · <i className='fa fa-chain-broken' title={intl.formatMessage(messages.local_only)} /></span>;
    }

    if (this.context.router) {
      favouriteLink = (
        <Link to={`/statuses/${status.get('id')}/favourites`} className='detailed-status__link'>
          <Icon id='star' />
          <span className='detailed-status__favorites'>
            <AnimatedNumber value={favouritesCount} />
          </span>
        </Link>
      );
    } else {
      favouriteLink = (
        <a href={`/interact/${status.get('id')}?type=favourite`} className='detailed-status__link' onClick={this.handleModalLink}>
          <Icon id='star' />
          <span className='detailed-status__favorites'>
            <AnimatedNumber value={favouritesCount} />
          </span>
        </a>
      );
    }

    if (this.context.router) {
      emojiReactionLink = (
        <Link to={`/statuses/${status.get('id')}/emoji_reactions`} className='detailed-status__link'>
          <Icon id='smile-o' />
          <span className='detailed-status__emoji_reactions'>
            <AnimatedNumber value={emojiReactionsCount} />
          </span>
        </Link>
      );
    } else {
      emojiReactionLink = (
        <a href={`/interact/${status.get('id')}?type=emoji_reactions`} className='detailed-status__link' onClick={this.handleModalLink}>
          <Icon id='smile-o' />
          <span className='detailed-status__emoji_reactions'>
            <AnimatedNumber value={emojiReactionsCount} />
          </span>
        </a>
      );
    }

    const expires_at = status.get('expires_at');
    const expires_date = expires_at && new Date(expires_at);
    const expired = expires_date && expires_date.getTime() < intl.now();

    return (
      <div style={outerStyle}>
        <div ref={this.setRef} className={classNames('detailed-status', `detailed-status-${status.get('visibility')}`, { compact, 'detailed-status-with-expiration': expires_date, 'detailed-status-expired': expired })}>
          <a href={status.getIn(['account', 'url'])} onClick={this.handleAccountClick} data-id={status.getIn(['account', 'id'])} data-group={status.getIn(['account', 'group'])} className='detailed-status__display-name'>
            <div className='detailed-status__display-avatar'><Avatar account={status.get('account')} size={48} /></div>
            <DisplayName account={status.get('account')} localDomain={this.props.domain} />
          </a>

          <StatusContent status={status} expanded={status.get('activity_pub_type') === 'Article' || !status.get('hidden')} onExpandedToggle={this.handleExpandedToggle} />

          {quote}
          {media}

          {enableReaction && <EmojiReactionsBar
            status={status}
            addEmojiReaction={this.props.addEmojiReaction}
            removeEmojiReaction={this.props.removeEmojiReaction}
            emojiMap={this.props.emojiMap}
          />}

          <div className='detailed-status__meta'>
            <a className='detailed-status__datetime' href={status.get('url')} target='_blank' rel='noopener noreferrer'>
              <FormattedDate value={new Date(status.get('created_at'))} hour12={false} year='numeric' month='short' day='2-digit' hour='2-digit' minute='2-digit' />
            </a>
            {status.get('expires_at') &&
              <span className='detailed-status__expiration-time'>
                <time dateTime={expires_at} title={intl.formatDate(expires_date, dateFormatOptions)}>
                  <i className='fa fa-clock-o' aria-hidden='true' />
                </time>
              </span>
            }
            {visibilityLink}{applicationLink}{reblogLink} · {favouriteLink} · {emojiReactionLink}{localOnly}
          </div>
        </div>
      </div>
    );
  }

}
