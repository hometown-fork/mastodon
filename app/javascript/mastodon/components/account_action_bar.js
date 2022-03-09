import React from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import PropTypes from 'prop-types';
import IconButton from './icon_button';
import { defineMessages, injectIntl } from 'react-intl';
import ImmutablePureComponent from 'react-immutable-pure-component';
import {
  me,
  show_follow_button_on_timeline,
  show_subscribe_button_on_timeline,
  show_followed_by,
  follow_button_to_list_adder,
} from '../initial_state';

const messages = defineMessages({
  follow: { id: 'account.follow', defaultMessage: 'Follow' },
  unfollow: { id: 'account.unfollow', defaultMessage: 'Unfollow' },
  unsubscribe: { id: 'account.unsubscribe', defaultMessage: 'Unsubscribe' },
  subscribe: { id: 'account.subscribe', defaultMessage: 'Subscribe' },
  requested: { id: 'account.requested', defaultMessage: 'Awaiting approval' },
});

export default @injectIntl
class AccountActionBar extends ImmutablePureComponent {

  static propTypes = {
    account: ImmutablePropTypes.map.isRequired,
    onFollow: PropTypes.func.isRequired,
    onSubscribe: PropTypes.func.isRequired,
    onAddToList: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
  };

  updateOnProps = [
    'account',
  ]

  handleFollow = (e) => {
    if ((e && e.shiftKey) ^ !follow_button_to_list_adder) {
      this.props.onFollow(this.props.account);
    } else {
      this.props.onAddToList(this.props.account);
    }
  }

  handleSubscribe = (e) => {
    if ((e && e.shiftKey) ^ !follow_button_to_list_adder) {
      this.props.onSubscribe(this.props.account);
    } else {
      this.props.onAddToList(this.props.account);
    }
  }

  render () {
    const { account, intl } = this.props;

    if (!account || (!show_follow_button_on_timeline && !show_subscribe_button_on_timeline)) {
      return <div />;
    }

    let buttons, following_buttons, subscribing_buttons;

    if (account.get('id') !== me && account.get('relationship', null) !== null) {
      const following        = account.getIn(['relationship', 'following']);
      const delivery         = account.getIn(['relationship', 'delivery_following']);
      const followed_by      = account.getIn(['relationship', 'followed_by']) && show_followed_by;
      const subscribing      = account.getIn(['relationship', 'subscribing'], new Map).size > 0;
      const subscribing_home = account.getIn(['relationship', 'subscribing', '-1'], new Map).size > 0;
      const requested        = account.getIn(['relationship', 'requested']);

      if (show_subscribe_button_on_timeline && (!account.get('moved') || subscribing)) {
        subscribing_buttons = <IconButton icon='rss-square' title={intl.formatMessage(subscribing ? messages.unsubscribe : messages.subscribe)} onClick={this.handleSubscribe} active={subscribing} no_delivery={subscribing && !subscribing_home} />;
      }
      if (show_follow_button_on_timeline && (!account.get('moved') || following)) {
        if (requested) {
          following_buttons = <IconButton disabled icon='hourglass' title={intl.formatMessage(messages.requested)} active={followed_by} />;
        } else {
          following_buttons = <IconButton icon={following ? 'user-times' : 'user-plus'} title={intl.formatMessage(following ? messages.unfollow : messages.follow)} onClick={this.handleFollow} active={following} passive={followed_by} no_delivery={following && !delivery} />;
        }
      }
      buttons = <span>{subscribing_buttons}{following_buttons}</span>
    }

    return (
      <div className='account__action-bar'>
        {buttons}
      </div>
    );
  }

}
