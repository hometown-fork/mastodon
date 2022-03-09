import {
  FAVOURITE_TAG_FETCH_SUCCESS,
  FAVOURITE_TAG_FETCH_FAIL,
  FAVOURITE_TAGS_FETCH_SUCCESS,
} from '../actions/favourite_tags';
import { Map as ImmutableMap, fromJS } from 'immutable';

const initialState = ImmutableMap();

const normalizeFavouriteTag = (state, favourite_tag) => state.set(favourite_tag.id, fromJS(favourite_tag));

const normalizeFavouriteTags = (state, favourite_tags) => {
  favourite_tags.forEach(favourite_tag => {
    state = normalizeFavouriteTag(state, favourite_tag);
  });

  return state;
};

export default function favourite_tags(state = initialState, action) {
  switch(action.type) {
  case FAVOURITE_TAG_FETCH_SUCCESS:
    return normalizeFavouriteTag(state, action.favourite_tag);
  case FAVOURITE_TAGS_FETCH_SUCCESS:
    return normalizeFavouriteTags(state, action.favourite_tags);
  case FAVOURITE_TAG_FETCH_FAIL:
    return state.set(action.id, false);
  default:
    return state;
  }
};
