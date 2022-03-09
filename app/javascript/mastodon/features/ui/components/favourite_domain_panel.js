import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { fetchFavouriteDomains } from 'mastodon/actions/favourite_domains';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { NavLink, withRouter } from 'react-router-dom';
import Icon from 'mastodon/components/icon';

export const getOrderedDomains = createSelector([state => state.get('favourite_domains')], favourite_domains => {
  if (!favourite_domains) {
    return favourite_domains;
  }

  return favourite_domains.toList().filter(item => !!item).sort((a, b) => a.get('updated_at').localeCompare(b.get('updated_at'))).take(10);
});

const mapStateToProps = state => ({
  favourite_domains: getOrderedDomains(state),
});

export default @withRouter
@connect(mapStateToProps)
class FavouriteDomainPanel extends ImmutablePureComponent {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    favourite_domains: ImmutablePropTypes.list,
  };

  componentDidMount () {
    const { dispatch } = this.props;
    dispatch(fetchFavouriteDomains());
  }

  render () {
    const { favourite_domains } = this.props;

    if (!favourite_domains || favourite_domains.isEmpty()) {
      return null;
    }

    return (
      <div>
        <hr />

        {favourite_domains.map(favourite_domain => (
          <NavLink key={favourite_domain.get('id')} className='column-link column-link--transparent' strict to={`/timelines/public/domain/${favourite_domain.get('name')}`}><Icon className='column-link__icon' id='users' fixedWidth />{favourite_domain.get('name')}</NavLink>
        ))}
      </div>
    );
  }

}
