import {
  ACCOUNT_FOLLOW_SUCCESS,
  ACCOUNT_UNFOLLOW_SUCCESS,
  ACCOUNT_SUBSCRIBE_SUCCESS,
  ACCOUNT_UNSUBSCRIBE_SUCCESS,
} from '../actions/accounts';
import { ACCOUNT_IMPORT, ACCOUNTS_IMPORT } from '../actions/importer';
import { Map as ImmutableMap, fromJS } from 'immutable';

const normalizeAccount = (state, account) => state.set(account.id, fromJS({
  followers_count: account.followers_count,
  following_count: account.following_count,
  subscribing_count: account.subscribing_count,
  statuses_count: account.statuses_count,
}));

const normalizeAccounts = (state, accounts) => {
  accounts.forEach(account => {
    state = normalizeAccount(state, account);
  });

  return state;
};

const initialState = ImmutableMap();

export default function accountsCounters(state = initialState, action) {
  switch(action.type) {
  case ACCOUNT_IMPORT:
    return normalizeAccount(state, action.account);
  case ACCOUNTS_IMPORT:
    return normalizeAccounts(state, action.accounts);
  case ACCOUNT_FOLLOW_SUCCESS:
    return action.alreadyFollowing ? state :
      state.updateIn([action.relationship.id, 'followers_count'], num => num + 1);
  case ACCOUNT_UNFOLLOW_SUCCESS:
    return state.updateIn([action.relationship.id, 'followers_count'], num => Math.max(0, num - 1));
  case ACCOUNT_SUBSCRIBE_SUCCESS:
    return action.alreadySubscribe ? state :
      state.updateIn([action.relationship.id, 'subscribing_count'], num => num + 1);
  case ACCOUNT_UNSUBSCRIBE_SUCCESS:
    return state.updateIn([action.relationship.id, 'subscribing_count'], num => Math.max(0, num - 1));
  default:
    return state;
  }
};
