import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ImmutablePureComponent from 'react-immutable-pure-component';
import ImmutablePropTypes from 'react-immutable-proptypes';
import IconButton from '../../../components/icon_button';
import { defineMessages, injectIntl } from 'react-intl';
import { followAccount, unsubscribeAccount, subscribeAccount } from '../../../actions/accounts';
import Icon from 'mastodon/components/icon';

const messages = defineMessages({
  title: { id: 'column.home', defaultMessage: 'Home' },
  remove: { id: 'home.account.remove', defaultMessage: 'Remove from home' },
  add: { id: 'home.account.add', defaultMessage: 'Add to home' },
  unsubscribe: { id: 'account.unsubscribe', defaultMessage: 'Unsubscribe' },
  subscribe: { id: 'account.subscribe', defaultMessage: 'Subscribe' },
  unsubscribeConfirm: { id: 'confirmations.unsubscribe.confirm', defaultMessage: 'Unsubscribe' },
});

const MapStateToProps = (state, { account }) => ({
  added: account.getIn(['relationship', 'delivery_following'], false),
});

const mapDispatchToProps = (dispatch) => ({
  onRemove (account) {
    dispatch(followAccount(account.get('id'), { delivery: false }));
  },

  onAdd (account) {
    dispatch(followAccount(account.get('id'), { delivery: true }));
  },

  onSubscribe (account) {
    if (account.getIn(['relationship', 'subscribing', '-1'], new Map).size > 0) {
      dispatch(unsubscribeAccount(account.get('id')));
    } else {
      dispatch(subscribeAccount(account.get('id')));
    }
  },
});

export default @connect(MapStateToProps, mapDispatchToProps)
@injectIntl
class Home extends ImmutablePureComponent {

  static propTypes = {
    account: ImmutablePropTypes.map.isRequired,
    intl: PropTypes.object.isRequired,
    onRemove: PropTypes.func.isRequired,
    onAdd: PropTypes.func.isRequired,
    onSubscribe: PropTypes.func.isRequired,
    added: PropTypes.bool,
    disabled: PropTypes.bool,
  };

  static defaultProps = {
    added: false,
    disabled: true,
  };

  handleRemove = () => {
    this.props.onRemove(this.props.account);
  }

  handleAdd = () => {
    this.props.onAdd(this.props.account);
  }

  handleSubscribe = () => {
    this.props.onSubscribe(this.props.account);
  }

  render () {
    const { account, intl, added, disabled } = this.props;

    const subscribing_home = account.getIn(['relationship', 'subscribing', '-1'], new Map).size > 0;

    let button, subscribing_buttons;

    if (!account.get('moved') || subscribing_home) {
      subscribing_buttons = <IconButton icon='rss-square' title={intl.formatMessage(subscribing_home ? messages.unsubscribe : messages.subscribe)} onClick={this.handleSubscribe} active={subscribing_home} />;
    }
    if (added) {
      button = <IconButton icon='times' title={intl.formatMessage(messages.remove)} onClick={this.handleRemove} active />;
    } else if (disabled) {
      button = <IconButton icon='plus' title={intl.formatMessage(messages.add)} onClick={this.handleAdd} />;
    } else {
      button = '';
    }

    return (
      <div className='list'>
        <div className='list__wrapper'>
          <div className='list__display-name'>
            <Icon id='home' className='column-link__icon' fixedWidth />
            {intl.formatMessage(messages.title)}
          </div>

          <div className='account__relationship'>
            {subscribing_buttons}
            {button}
          </div>
        </div>
      </div>
    );
  }

}
