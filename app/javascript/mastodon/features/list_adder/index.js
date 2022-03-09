import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { injectIntl } from 'react-intl';
import { setupListAdder, resetListAdder } from '../../actions/lists';
import { createSelector } from 'reselect';
import { makeGetAccount } from '../../selectors';
import Home from './components/home';
import List from './components/list';
import Account from './components/account';
import NewListForm from '../lists/components/new_list_form';
// hack

const getOrderedLists = createSelector([state => state.get('lists')], lists => {
  if (!lists) {
    return lists;
  }

  return lists.toList().filter(item => !!item).sort((a, b) => a.get('title').localeCompare(b.get('title')));
});

const getAccount = makeGetAccount();

const mapStateToProps = (state, { accountId }) => ({
  account: getAccount(state, accountId),
  listIds: getOrderedLists(state).map(list=>list.get('id')),
});

const mapDispatchToProps = dispatch => ({
  onInitialize: accountId => dispatch(setupListAdder(accountId)),
  onReset: () => dispatch(resetListAdder()),
});

export default @connect(mapStateToProps, mapDispatchToProps)
@injectIntl
class ListAdder extends ImmutablePureComponent {

  static propTypes = {
    account: ImmutablePropTypes.map.isRequired,
    onClose: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
    onInitialize: PropTypes.func.isRequired,
    onReset: PropTypes.func.isRequired,
    listIds: ImmutablePropTypes.list.isRequired,
  };

  componentDidMount () {
    const { onInitialize, account } = this.props;
    onInitialize(account.get('id'));
  }

  componentWillUnmount () {
    const { onReset } = this.props;
    onReset();
  }

  render () {
    const { account, listIds, intl } = this.props;

    const following = account.getIn(['relationship', 'following']);

    return (
      <div className='modal-root__modal list-adder'>
        <div className='list-adder__account'>
          <Account account={account} intl={intl} />
        </div>

        <NewListForm />

        <div className='list-adder__lists'>
          <Home account={account} disabled={following} intl={intl} />
          {listIds.map(ListId => <List key={ListId} account={account} listId={ListId} disabled={following} intl={intl} />)}
        </div>
      </div>
    );
  }

}
