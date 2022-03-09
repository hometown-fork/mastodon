import React from 'react';
import Column from '../ui/components/column';
import ColumnLink from '../ui/components/column_link';
import ColumnSubheading from '../ui/components/column_subheading';
import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { me, profile_directory, showTrends, enable_limited_timeline } from '../../initial_state';
import { fetchFollowRequests } from 'mastodon/actions/accounts';
import { fetchFavouriteDomains } from 'mastodon/actions/favourite_domains';
import { fetchFavouriteTags } from 'mastodon/actions/favourite_tags';
import { List as ImmutableList } from 'immutable';
import NavigationContainer from '../compose/containers/navigation_container';
import Icon from 'mastodon/components/icon';
import LinkFooter from 'mastodon/features/ui/components/link_footer';
import { getOrderedLists } from 'mastodon/features/ui/components/list_panel';
import { getOrderedDomains } from 'mastodon/features/ui/components/favourite_domain_panel';
import { getOrderedTags } from 'mastodon/features/ui/components/favourite_tag_panel';
import TrendsContainer from './containers/trends_container';

const messages = defineMessages({
  home_timeline: { id: 'tabs_bar.home', defaultMessage: 'Home' },
  notifications: { id: 'tabs_bar.notifications', defaultMessage: 'Notifications' },
  public_timeline: { id: 'navigation_bar.public_timeline', defaultMessage: 'Federated timeline' },
  settings_subheading: { id: 'column_subheading.settings', defaultMessage: 'Settings' },
  community_timeline: { id: 'navigation_bar.community_timeline', defaultMessage: 'Local timeline' },
  direct: { id: 'navigation_bar.direct', defaultMessage: 'Direct messages' },
  bookmarks: { id: 'navigation_bar.bookmarks', defaultMessage: 'Bookmarks' },
  preferences: { id: 'navigation_bar.preferences', defaultMessage: 'Preferences' },
  follow_requests: { id: 'navigation_bar.follow_requests', defaultMessage: 'Follow requests' },
  favourites: { id: 'navigation_bar.favourites', defaultMessage: 'Favourites' },
  emoji_reactions: { id: 'navigation_bar.emoji_reactions', defaultMessage: 'Emoji reactions' },
  blocks: { id: 'navigation_bar.blocks', defaultMessage: 'Blocked users' },
  domain_blocks: { id: 'navigation_bar.domain_blocks', defaultMessage: 'Hidden domains' },
  mutes: { id: 'navigation_bar.mutes', defaultMessage: 'Muted users' },
  pins: { id: 'navigation_bar.pins', defaultMessage: 'Pinned posts' },
  limited_timeline: { id: 'navigation_bar.limited_timeline', defaultMessage: 'Limited home' },
  lists: { id: 'navigation_bar.lists', defaultMessage: 'Lists' },
  circles: { id: 'navigation_bar.circles', defaultMessage: 'Circles' },
  discover: { id: 'navigation_bar.discover', defaultMessage: 'Discover' },
  personal: { id: 'navigation_bar.personal', defaultMessage: 'Personal' },
  security: { id: 'navigation_bar.security', defaultMessage: 'Security' },
  menu: { id: 'getting_started.heading', defaultMessage: 'Getting started' },
  group_directory: { id: 'getting_started.group_directory', defaultMessage: 'Group directory' },
  profile_directory: { id: 'getting_started.directory', defaultMessage: 'Profile directory' },
  suggestions: { id: 'navigation_bar.suggestions', defaultMessage: 'Suggestions' },
  trends: { id: 'navigation_bar.trends', defaultMessage: 'Trends' },
  lists_subheading: { id: 'column_subheading.favourite_lists', defaultMessage: 'Favourite Lists' },
  favourite_domains_subheading: { id: 'column_subheading.favourite_domains', defaultMessage: 'Favourite domains' },
  favourite_tags_subheading: { id: 'column_subheading.favourite_tags', defaultMessage: 'Favourite tags' },
});

const mapStateToProps = state => ({
  myAccount: state.getIn(['accounts', me]),
  columns: state.getIn(['settings', 'columns']),
  unreadFollowRequests: state.getIn(['user_lists', 'follow_requests', 'items'], ImmutableList()).size,
  lists: getOrderedLists(state),
  favourite_domains: getOrderedDomains(state),
  favourite_tags: getOrderedTags(state),
});

const mapDispatchToProps = dispatch => ({
  fetchFollowRequests: () => dispatch(fetchFollowRequests()),
  fetchFavouriteDomains: () => dispatch(fetchFavouriteDomains()),
  fetchFavouriteTags: () => dispatch(fetchFavouriteTags()),
});

const badgeDisplay = (number, limit) => {
  if (number === 0) {
    return undefined;
  } else if (limit && number >= limit) {
    return `${limit}+`;
  } else {
    return number;
  }
};

const NAVIGATION_PANEL_BREAKPOINT = 600 + (285 * 2) + (10 * 2);

export default @connect(mapStateToProps, mapDispatchToProps)
@injectIntl
class GettingStarted extends ImmutablePureComponent {

  static contextTypes = {
    router: PropTypes.object.isRequired,
  };

  static propTypes = {
    intl: PropTypes.object.isRequired,
    myAccount: ImmutablePropTypes.map.isRequired,
    columns: ImmutablePropTypes.list,
    multiColumn: PropTypes.bool,
    fetchFollowRequests: PropTypes.func.isRequired,
    fetchFavouriteDomains: PropTypes.func.isRequired,
    fetchFavouriteTags: PropTypes.func.isRequired,
    unreadFollowRequests: PropTypes.number,
    unreadNotifications: PropTypes.number,
    lists: ImmutablePropTypes.list,
    favourite_domains: ImmutablePropTypes.list,
    favourite_tags: ImmutablePropTypes.list,
  };

  componentDidMount () {
    const { fetchFollowRequests, fetchFavouriteDomains, fetchFavouriteTags, multiColumn } = this.props;

    if (!multiColumn && window.innerWidth >= NAVIGATION_PANEL_BREAKPOINT) {
      this.context.router.history.replace('/timelines/home');
      return;
    }

    fetchFollowRequests();
    fetchFavouriteDomains();
    fetchFavouriteTags();
  }

  render () {
    const { intl, myAccount, columns, multiColumn, unreadFollowRequests, lists, favourite_domains, favourite_tags } = this.props;

    const navItems = [];
    let height = (multiColumn) ? 0 : 60;

    if (multiColumn) {
      navItems.push(
        <ColumnSubheading key='header-discover' text={intl.formatMessage(messages.discover)} />,
        <ColumnLink key='community_timeline' icon='users' text={intl.formatMessage(messages.community_timeline)} to='/timelines/public/local' />,
        <ColumnLink key='public_timeline' icon='globe' text={intl.formatMessage(messages.public_timeline)} to='/timelines/public' />,
      );

      height += 34 + 48*2;

      navItems.push(
        <ColumnLink key='group_directory' icon='address-book' text={intl.formatMessage(messages.group_directory)} to='/group_directory' />,
      );

      height += 48;

      if (profile_directory) {
        navItems.push(
          <ColumnLink key='directory' icon='address-book' text={intl.formatMessage(messages.profile_directory)} to='/directory' />,
        );

        height += 48;
      }

      navItems.push(
        <ColumnLink key='suggestions' icon='user-plus' text={intl.formatMessage(messages.suggestions)} to='/suggestions' />,
        <ColumnLink key='trends' icon='line-chart' text={intl.formatMessage(messages.trends)} to='/trends' />,
      );

      height += 48*2;

      navItems.push(
        <ColumnSubheading key='header-personal' text={intl.formatMessage(messages.personal)} />
      );

      height += 34;
    } else {
      navItems.push(
        <ColumnLink key='group_directory' icon='address-book' text={intl.formatMessage(messages.group_directory)} to='/group_directory' />,
      );

      height += 48;

      if (profile_directory) {
        navItems.push(
          <ColumnLink key='directory' icon='address-book' text={intl.formatMessage(messages.profile_directory)} to='/directory' />,
        );

        height += 48;
      }

      navItems.push(
        <ColumnLink key='suggestions' icon='user-plus' text={intl.formatMessage(messages.suggestions)} to='/suggestions' />,
        <ColumnLink key='trends' icon='line-chart' text={intl.formatMessage(messages.trends)} to='/trends' />,
      );

      height += 48*2;
    }

    if (multiColumn && !columns.find(item => item.get('id') === 'HOME')) {
      navItems.push(
        <ColumnLink key='home' icon='home' text={intl.formatMessage(messages.home_timeline)} to='/timelines/home' />,
      );
      height += 48;
    }

    if (enable_limited_timeline && multiColumn && !columns.find(item => item.get('id') === 'LIMITED')) {
      navItems.push(
        <ColumnLink key='limited_timeline' icon='lock' text={intl.formatMessage(messages.limited_timeline)} to='/timelines/limited' />,
      );
      height += 48;
    }

    navItems.push(
      <ColumnLink key='direct' icon='envelope' text={intl.formatMessage(messages.direct)} to='/timelines/direct' />,
      <ColumnLink key='bookmark' icon='bookmark' text={intl.formatMessage(messages.bookmarks)} to='/bookmarks' />,
      <ColumnLink key='favourites' icon='star' text={intl.formatMessage(messages.favourites)} to='/favourites' />,
      <ColumnLink key='emoji_reactions' icon='smile-o' text={intl.formatMessage(messages.emoji_reactions)} to='/emoji_reactions' />,
      <ColumnLink key='lists' icon='list-ul' text={intl.formatMessage(messages.lists)} to='/lists' />,
      <ColumnLink key='circles' icon='user-circle' text={intl.formatMessage(messages.circles)} to='/circles' />,
    );

    height += 48*6;

    if (lists && !lists.isEmpty()) {
      navItems.push(<ColumnSubheading key='header-lists' text={intl.formatMessage(messages.lists_subheading)} />);
      height += 34;

      lists.map(list => {
        navItems.push(<ColumnLink key={`list:${list.get('id')}`} icon='list-ul' text={list.get('title')} to={`/timelines/list/${list.get('id')}`} />);
        height += 48
      })
    }

    if (favourite_domains && !favourite_domains.isEmpty()) {
      navItems.push(<ColumnSubheading key='header-sfavourite_domains' text={intl.formatMessage(messages.favourite_domains_subheading)} />);
      height += 34;

      favourite_domains.map(favourite_domain => {
        navItems.push(<ColumnLink key={`favourite_domain:${favourite_domain.get('id')}`} icon='users' text={favourite_domain.get('name')} to={`/timelines/public/domain/${favourite_domain.get('name')}`} />);
        height += 48
      })
    }

    if (favourite_tags && !favourite_tags.isEmpty()) {
      navItems.push(<ColumnSubheading key='header-favourite_tags' text={intl.formatMessage(messages.favourite_tags_subheading)} />);
      height += 34;

      favourite_tags.map(favourite_tag => {
        navItems.push(<ColumnLink key={`favourite_tag:${favourite_tag.get('id')}`} icon='hashtag' text={favourite_tag.get('name')} to={`/timelines/tag/${favourite_tag.get('name')}`} />);
        height += 48
      })
    }

    if (myAccount.get('locked') || unreadFollowRequests > 0) {
      navItems.push(<ColumnLink key='follow_requests' icon='user-plus' text={intl.formatMessage(messages.follow_requests)} badge={badgeDisplay(unreadFollowRequests, 40)} to='/follow_requests' />);
      height += 48;
    }

    if (!multiColumn) {
      navItems.push(
        <ColumnSubheading key='header-settings' text={intl.formatMessage(messages.settings_subheading)} />,
        <ColumnLink key='preferences' icon='gears' text={intl.formatMessage(messages.preferences)} href='/settings/preferences' />,
      );

      height += 34 + 48;
    }

    return (
      <Column bindToDocument={!multiColumn} label={intl.formatMessage(messages.menu)}>
        {multiColumn && <div className='column-header__wrapper'>
          <h1 className='column-header'>
            <button>
              <Icon id='bars' className='column-header__icon' fixedWidth />
              <FormattedMessage id='getting_started.heading' defaultMessage='Getting started' />
            </button>
          </h1>
        </div>}

        <div className='getting-started'>
          <div className='getting-started__wrapper' style={{ height }}>
            {!multiColumn && <NavigationContainer />}
            {navItems}
          </div>

          {!multiColumn && <div className='flex-spacer' />}

          <LinkFooter withHotkeys={multiColumn} />
        </div>

        {multiColumn && showTrends && <TrendsContainer />}
      </Column>
    );
  }

}
