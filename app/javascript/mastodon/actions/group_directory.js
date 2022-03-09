import api from '../api';
import { importFetchedAccounts } from './importer';
import { fetchRelationships } from './accounts';

export const GROUP_DIRECTORY_FETCH_REQUEST = 'GROUP_DIRECTORY_FETCH_REQUEST';
export const GROUP_DIRECTORY_FETCH_SUCCESS = 'GROUP_DIRECTORY_FETCH_SUCCESS';
export const GROUP_DIRECTORY_FETCH_FAIL    = 'GROUP_DIRECTORY_FETCH_FAIL';

export const GROUP_DIRECTORY_EXPAND_REQUEST = 'GROUP_DIRECTORY_EXPAND_REQUEST';
export const GROUP_DIRECTORY_EXPAND_SUCCESS = 'GROUP_DIRECTORY_EXPAND_SUCCESS';
export const GROUP_DIRECTORY_EXPAND_FAIL    = 'GROUP_DIRECTORY_EXPAND_FAIL';

export const fetchGroupDirectory = params => (dispatch, getState) => {
  dispatch(fetchGroupDirectoryRequest());

  api(getState).get('/api/v1/group_directory', { params: { ...params, limit: 20 } }).then(({ data }) => {
    dispatch(importFetchedAccounts(data));
    dispatch(fetchGroupDirectorySuccess(data));
    dispatch(fetchRelationships(data.map(x => x.id)));
  }).catch(error => dispatch(fetchGroupDirectoryFail(error)));
};

export const fetchGroupDirectoryRequest = () => ({
  type: GROUP_DIRECTORY_FETCH_REQUEST,
});

export const fetchGroupDirectorySuccess = accounts => ({
  type: GROUP_DIRECTORY_FETCH_SUCCESS,
  accounts,
});

export const fetchGroupDirectoryFail = error => ({
  type: GROUP_DIRECTORY_FETCH_FAIL,
  error,
});

export const expandGroupDirectory = params => (dispatch, getState) => {
  dispatch(expandGroupDirectoryRequest());

  const loadedItems = getState().getIn(['user_lists', 'group_directory', 'items']).size;

  api(getState).get('/api/v1/group_directory', { params: { ...params, offset: loadedItems, limit: 20 } }).then(({ data }) => {
    dispatch(importFetchedAccounts(data));
    dispatch(expandGroupDirectorySuccess(data));
    dispatch(fetchRelationships(data.map(x => x.id)));
  }).catch(error => dispatch(expandGroupDirectoryFail(error)));
};

export const expandGroupDirectoryRequest = () => ({
  type: GROUP_DIRECTORY_EXPAND_REQUEST,
});

export const expandGroupDirectorySuccess = accounts => ({
  type: GROUP_DIRECTORY_EXPAND_SUCCESS,
  accounts,
});

export const expandGroupDirectoryFail = error => ({
  type: GROUP_DIRECTORY_EXPAND_FAIL,
  error,
});
