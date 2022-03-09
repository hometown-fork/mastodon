import {
  FAVOURITE_DOMAIN_FETCH_SUCCESS,
  FAVOURITE_DOMAIN_FETCH_FAIL,
  FAVOURITE_DOMAINS_FETCH_SUCCESS,
} from '../actions/favourite_domains';
import { Map as ImmutableMap, fromJS } from 'immutable';

const initialState = ImmutableMap();

const normalizeFavouriteDomain = (state, favourite_domain) => state.set(favourite_domain.id, fromJS(favourite_domain));

const normalizeFavouriteDomains = (state, favourite_domains) => {
  favourite_domains.forEach(favourite_domain => {
    state = normalizeFavouriteDomain(state, favourite_domain);
  });

  return state;
};

export default function favourite_domains(state = initialState, action) {
  switch(action.type) {
  case FAVOURITE_DOMAIN_FETCH_SUCCESS:
    return normalizeFavouriteDomain(state, action.favourite_domain);
  case FAVOURITE_DOMAINS_FETCH_SUCCESS:
    return normalizeFavouriteDomains(state, action.favourite_domains);
  case FAVOURITE_DOMAIN_FETCH_FAIL:
    return state.set(action.id, false);
  default:
    return state;
  }
};
