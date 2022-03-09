import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { fetchFavouriteTags } from 'mastodon/actions/favourite_tags';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { NavLink, withRouter } from 'react-router-dom';
import Icon from 'mastodon/components/icon';

export const getOrderedTags = createSelector([state => state.get('favourite_tags')], favourite_tags => {
  if (!favourite_tags) {
    return favourite_tags;
  }

  return favourite_tags.toList().filter(item => !!item).sort((a, b) => a.get('updated_at').localeCompare(b.get('updated_at'))).take(10);
});

const mapStateToProps = state => ({
  favourite_tags: getOrderedTags(state),
});

export default @withRouter
@connect(mapStateToProps)
class FavouriteTagPanel extends ImmutablePureComponent {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    favourite_tags: ImmutablePropTypes.list,
  };

  componentDidMount () {
    const { dispatch } = this.props;
    dispatch(fetchFavouriteTags());
  }

  render () {
    const { favourite_tags } = this.props;

    if (!favourite_tags || favourite_tags.isEmpty()) {
      return null;
    }

    return (
      <div>
        <hr />

        {favourite_tags.map(favourite_tag => (
          <NavLink key={favourite_tag.get('id')} className='column-link column-link--transparent' strict to={`/timelines/tag/${favourite_tag.get('name')}`}><Icon className='column-link__icon' id='hashtag' fixedWidth />{favourite_tag.get('name')}</NavLink>
        ))}
      </div>
    );
  }

}
