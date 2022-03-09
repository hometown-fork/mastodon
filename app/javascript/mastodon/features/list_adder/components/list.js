import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ImmutablePureComponent from 'react-immutable-pure-component';
import ImmutablePropTypes from 'react-immutable-proptypes';
import IconButton from '../../../components/icon_button';
import { defineMessages, injectIntl } from 'react-intl';
import { unsubscribeAccount, subscribeAccount } from '../../../actions/accounts';
import { removeFromListAdder, addToListAdder } from '../../../actions/lists';
import Icon from 'mastodon/components/icon';

const messages = defineMessages({
  remove: { id: 'lists.account.remove', defaultMessage: 'Remove from list' },
  add: { id: 'lists.account.add', defaultMessage: 'Add to list' },
  unsubscribe: { id: 'account.unsubscribe', defaultMessage: 'Unsubscribe' },
  subscribe: { id: 'account.subscribe', defaultMessage: 'Subscribe' },
  unsubscribeConfirm: { id: 'confirmations.unsubscribe.confirm', defaultMessage: 'Unsubscribe' },
});

const MapStateToProps = (state, { listId, added }) => ({
  list: state.get('lists').get(listId),
  added: typeof added === 'undefined' ? state.getIn(['listAdder', 'lists', 'items']).includes(listId) : added,
});

const mapDispatchToProps = (dispatch, { listId }) => ({
  onRemove: () => dispatch(removeFromListAdder(listId)),
  onAdd: () => dispatch(addToListAdder(listId)),

  onSubscribe (account) {
    if (account.getIn(['relationship', 'subscribing', listId], new Map).size > 0) {
      dispatch(unsubscribeAccount(account.get('id'), listId));
    } else {
      dispatch(subscribeAccount(account.get('id'), true, listId));
    }
  },
});

export default @connect(MapStateToProps, mapDispatchToProps)
@injectIntl
class List extends ImmutablePureComponent {

  static propTypes = {
    account: ImmutablePropTypes.map.isRequired,
    list: ImmutablePropTypes.map.isRequired,
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

  handleSubscribe = () => {
    this.props.onSubscribe(this.props.account);
  }

  render () {
    const { account, list, intl, onRemove, onAdd, added, disabled } = this.props;

    const subscribing = account.getIn(['relationship', 'subscribing', list.get('id')], new Map).size > 0;

    let button, subscribing_buttons;

    if (!account.get('moved') || subscribing) {
      subscribing_buttons = <IconButton icon='rss-square' title={intl.formatMessage(subscribing ? messages.unsubscribe : messages.subscribe)} onClick={this.handleSubscribe} active={subscribing} />;
    }
    if (added) {
      button = <IconButton icon='times' title={intl.formatMessage(messages.remove)} onClick={onRemove} active />;
    } else if (disabled) {
      button = <IconButton icon='plus' title={intl.formatMessage(messages.add)} onClick={onAdd} />;
    } else {
      button = '';
    }

    return (
      <div className='list'>
        <div className='list__wrapper'>
          <div className='list__display-name'>
            <Icon id='list-ul' className='column-link__icon' fixedWidth />
            {list.get('title')}
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
