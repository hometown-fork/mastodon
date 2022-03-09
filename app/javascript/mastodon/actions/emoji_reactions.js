import { fetchRelationships } from './accounts';
import api, { getLinks } from '../api';
import { importFetchedStatuses } from './importer';
import { uniq } from '../utils/uniq';

export const EMOJI_REACTIONED_STATUSES_FETCH_REQUEST = 'EMOJI_REACTIONED_STATUSES_FETCH_REQUEST';
export const EMOJI_REACTIONED_STATUSES_FETCH_SUCCESS = 'EMOJI_REACTIONED_STATUSES_FETCH_SUCCESS';
export const EMOJI_REACTIONED_STATUSES_FETCH_FAIL    = 'EMOJI_REACTIONED_STATUSES_FETCH_FAIL';

export const EMOJI_REACTIONED_STATUSES_EXPAND_REQUEST = 'EMOJI_REACTIONED_STATUSES_EXPAND_REQUEST';
export const EMOJI_REACTIONED_STATUSES_EXPAND_SUCCESS = 'EMOJI_REACTIONED_STATUSES_EXPAND_SUCCESS';
export const EMOJI_REACTIONED_STATUSES_EXPAND_FAIL    = 'EMOJI_REACTIONED_STATUSES_EXPAND_FAIL';

export function fetchEmojiReactionedStatuses() {
  return (dispatch, getState) => {
    if (getState().getIn(['status_lists', 'emoji_reactions', 'isLoading'])) {
      return;
    }

    dispatch(fetchEmojiReactionedStatusesRequest());

    api(getState).get('/api/v1/emoji_reactions').then(response => {
      const next = getLinks(response).refs.find(link => link.rel === 'next');
      dispatch(importFetchedStatuses(response.data));
      dispatch(fetchRelationships(uniq(response.data.map(item => item.reblog ? item.reblog.account.id : item.account.id))));
      dispatch(fetchEmojiReactionedStatusesSuccess(response.data, next ? next.uri : null));
    }).catch(error => {
      dispatch(fetchEmojiReactionedStatusesFail(error));
    });
  };
};

export function fetchEmojiReactionedStatusesRequest() {
  return {
    type: EMOJI_REACTIONED_STATUSES_FETCH_REQUEST,
  };
};

export function fetchEmojiReactionedStatusesSuccess(statuses, next) {
  return {
    type: EMOJI_REACTIONED_STATUSES_FETCH_SUCCESS,
    statuses,
    next,
  };
};

export function fetchEmojiReactionedStatusesFail(error) {
  return {
    type: EMOJI_REACTIONED_STATUSES_FETCH_FAIL,
    error,
  };
};

export function expandEmojiReactionedStatuses() {
  return (dispatch, getState) => {
    const url = getState().getIn(['status_lists', 'emoji_reactions', 'next'], null);

    if (url === null || getState().getIn(['status_lists', 'emoji_reactions', 'isLoading'])) {
      return;
    }

    dispatch(expandEmojiReactionedStatusesRequest());

    api(getState).get(url).then(response => {
      const next = getLinks(response).refs.find(link => link.rel === 'next');
      dispatch(importFetchedStatuses(response.data));
      dispatch(fetchRelationships(uniq(response.data.map(item => item.reblog ? item.reblog.account.id : item.account.id))));
      dispatch(expandEmojiReactionedStatusesSuccess(response.data, next ? next.uri : null));
    }).catch(error => {
      dispatch(expandEmojiReactionedStatusesFail(error));
    });
  };
};

export function expandEmojiReactionedStatusesRequest() {
  return {
    type: EMOJI_REACTIONED_STATUSES_EXPAND_REQUEST,
  };
};

export function expandEmojiReactionedStatusesSuccess(statuses, next) {
  return {
    type: EMOJI_REACTIONED_STATUSES_EXPAND_SUCCESS,
    statuses,
    next,
  };
};

export function expandEmojiReactionedStatusesFail(error) {
  return {
    type: EMOJI_REACTIONED_STATUSES_EXPAND_FAIL,
    error,
  };
};
