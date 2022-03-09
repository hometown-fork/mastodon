import api from '../api';

export const FAVOURITE_TAG_FETCH_REQUEST = 'FAVOURITE_TAG_FETCH_REQUEST';
export const FAVOURITE_TAG_FETCH_SUCCESS = 'FAVOURITE_TAG_FETCH_SUCCESS';
export const FAVOURITE_TAG_FETCH_FAIL    = 'FAVOURITE_TAG_FETCH_FAIL';

export const FAVOURITE_TAGS_FETCH_REQUEST = 'FAVOURITE_TAGS_FETCH_REQUEST';
export const FAVOURITE_TAGS_FETCH_SUCCESS = 'FAVOURITE_TAGS_FETCH_SUCCESS';
export const FAVOURITE_TAGS_FETCH_FAIL    = 'FAVOURITE_TAGS_FETCH_FAIL';

export const fetchFavouriteTag = id => (dispatch, getState) => {
  if (getState().getIn(['favourite_tags', id])) {
    return;
  }

  dispatch(fetchFavouriteTagRequest(id));

  api(getState).get(`/api/v1/favourite_tags/${id}`)
    .then(({ data }) => dispatch(fetchFavouriteTagSuccess(data)))
    .catch(err => dispatch(fetchFavouriteTagFail(id, err)));
};

export const fetchFavouriteTagRequest = id => ({
  type: FAVOURITE_TAG_FETCH_REQUEST,
  id,
});

export const fetchFavouriteTagSuccess = favourite_tag => ({
  type: FAVOURITE_TAG_FETCH_SUCCESS,
  favourite_tag,
});

export const fetchFavouriteTagFail = (id, error) => ({
  type: FAVOURITE_TAG_FETCH_FAIL,
  id,
  error,
});

export const fetchFavouriteTags = () => (dispatch, getState) => {
  dispatch(fetchFavouriteTagsRequest());

  api(getState).get('/api/v1/favourite_tags')
    .then(({ data }) => dispatch(fetchFavouriteTagsSuccess(data)))
    .catch(err => dispatch(fetchFavouriteTagsFail(err)));
};

export const fetchFavouriteTagsRequest = () => ({
  type: FAVOURITE_TAGS_FETCH_REQUEST,
});

export const fetchFavouriteTagsSuccess = favourite_tags => ({
  type: FAVOURITE_TAGS_FETCH_SUCCESS,
  favourite_tags,
});

export const fetchFavouriteTagsFail = error => ({
  type: FAVOURITE_TAGS_FETCH_FAIL,
  error,
});
