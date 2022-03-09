import api from '../api';

export const FAVOURITE_DOMAIN_FETCH_REQUEST = 'FAVOURITE_DOMAIN_FETCH_REQUEST';
export const FAVOURITE_DOMAIN_FETCH_SUCCESS = 'FAVOURITE_DOMAIN_FETCH_SUCCESS';
export const FAVOURITE_DOMAIN_FETCH_FAIL    = 'FAVOURITE_DOMAIN_FETCH_FAIL';

export const FAVOURITE_DOMAINS_FETCH_REQUEST = 'FAVOURITE_DOMAINS_FETCH_REQUEST';
export const FAVOURITE_DOMAINS_FETCH_SUCCESS = 'FAVOURITE_DOMAINS_FETCH_SUCCESS';
export const FAVOURITE_DOMAINS_FETCH_FAIL    = 'FAVOURITE_DOMAINS_FETCH_FAIL';

export const fetchFavouriteDomain = id => (dispatch, getState) => {
  if (getState().getIn(['favourite_domains', id])) {
    return;
  }

  dispatch(fetchFavouriteDomainRequest(id));

  api(getState).get(`/api/v1/favourite_domains/${id}`)
    .then(({ data }) => dispatch(fetchFavouriteDomainSuccess(data)))
    .catch(err => dispatch(fetchFavouriteDomainFail(id, err)));
};

export const fetchFavouriteDomainRequest = id => ({
  type: FAVOURITE_DOMAIN_FETCH_REQUEST,
  id,
});

export const fetchFavouriteDomainSuccess = favourite_domain => ({
  type: FAVOURITE_DOMAIN_FETCH_SUCCESS,
  favourite_domain,
});

export const fetchFavouriteDomainFail = (id, error) => ({
  type: FAVOURITE_DOMAIN_FETCH_FAIL,
  id,
  error,
});

export const fetchFavouriteDomains = () => (dispatch, getState) => {
  dispatch(fetchFavouriteDomainsRequest());

  api(getState).get('/api/v1/favourite_domains')
    .then(({ data }) => dispatch(fetchFavouriteDomainsSuccess(data)))
    .catch(err => dispatch(fetchFavouriteDomainsFail(err)));
};

export const fetchFavouriteDomainsRequest = () => ({
  type: FAVOURITE_DOMAINS_FETCH_REQUEST,
});

export const fetchFavouriteDomainsSuccess = favourite_domains => ({
  type: FAVOURITE_DOMAINS_FETCH_SUCCESS,
  favourite_domains,
});

export const fetchFavouriteDomainsFail = error => ({
  type: FAVOURITE_DOMAINS_FETCH_FAIL,
  error,
});
