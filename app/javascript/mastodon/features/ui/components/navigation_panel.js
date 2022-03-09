import React from 'react';
import { NavLink, withRouter } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import Icon from 'mastodon/components/icon';
import { profile_directory, showTrends, enable_limited_timeline } from 'mastodon/initial_state';
import NotificationsCounterIcon from './notifications_counter_icon';
import FollowRequestsNavLink from './follow_requests_nav_link';
import ListPanel from './list_panel';
import FavouriteDomainPanel from './favourite_domain_panel';
import FavouriteTagPanel from './favourite_tag_panel';
import TrendsContainer from 'mastodon/features/getting_started/containers/trends_container';

const NavigationPanel = () => (
  <div className='navigation-panel'>
    <NavLink className='column-link column-link--transparent' to='/timelines/home' data-preview-title-id='column.home' data-preview-icon='home' ><Icon className='column-link__icon' id='home' fixedWidth /><FormattedMessage id='tabs_bar.home' defaultMessage='Home' /></NavLink>
    {enable_limited_timeline && <NavLink className='column-link column-link--transparent' to='/timelines/limited' data-preview-title-id='column.limited' data-preview-icon='lock' ><Icon className='column-link__icon' id='lock' fixedWidth /><FormattedMessage id='navigation_bar.limited_timeline' defaultMessage='Limited home' /></NavLink>}
    <NavLink className='column-link column-link--transparent' to='/notifications' data-preview-title-id='column.notifications' data-preview-icon='bell' ><NotificationsCounterIcon className='column-link__icon' /><FormattedMessage id='tabs_bar.notifications' defaultMessage='Notifications' /></NavLink>
    <FollowRequestsNavLink />
    <NavLink className='column-link column-link--transparent' to='/timelines/public/local' data-preview-title-id='column.community' data-preview-icon='users' ><Icon className='column-link__icon' id='users' fixedWidth /><FormattedMessage id='tabs_bar.local_timeline' defaultMessage='Local' /></NavLink>
    <NavLink className='column-link column-link--transparent' exact to='/timelines/public' data-preview-title-id='column.public' data-preview-icon='globe' ><Icon className='column-link__icon' id='globe' fixedWidth /><FormattedMessage id='tabs_bar.federated_timeline' defaultMessage='Federated' /></NavLink>
    <NavLink className='column-link column-link--transparent' to='/timelines/direct'><Icon className='column-link__icon' id='envelope' fixedWidth /><FormattedMessage id='navigation_bar.direct' defaultMessage='Direct messages' /></NavLink>
    <NavLink className='column-link column-link--transparent' to='/favourites'><Icon className='column-link__icon' id='star' fixedWidth /><FormattedMessage id='navigation_bar.favourites' defaultMessage='Favourites' /></NavLink>
    <NavLink className='column-link column-link--transparent' to='/bookmarks'><Icon className='column-link__icon' id='bookmark' fixedWidth /><FormattedMessage id='navigation_bar.bookmarks' defaultMessage='Bookmarks' /></NavLink>
    <NavLink className='column-link column-link--transparent' to='/emoji_reactions'><Icon className='column-link__icon' id='smile-o' fixedWidth /><FormattedMessage id='navigation_bar.emoji_reactions' defaultMessage='Emoji reactions' /></NavLink>
    <NavLink className='column-link column-link--transparent' to='/lists'><Icon className='column-link__icon' id='list-ul' fixedWidth /><FormattedMessage id='navigation_bar.lists' defaultMessage='Lists' /></NavLink>
    <NavLink className='column-link column-link--transparent' to='/circles'><Icon className='column-link__icon' id='user-circle' fixedWidth /><FormattedMessage id='navigation_bar.circles' defaultMessage='Circles' /></NavLink>
    <NavLink className='column-link column-link--transparent' to='/group_directory'><Icon className='column-link__icon' id='address-book-o' fixedWidth /><FormattedMessage id='getting_started.group_directory' defaultMessage='Group directory' /></NavLink>
    {profile_directory && <NavLink className='column-link column-link--transparent' to='/directory'><Icon className='column-link__icon' id='address-book-o' fixedWidth /><FormattedMessage id='getting_started.directory' defaultMessage='Profile directory' /></NavLink>}
    <NavLink className='column-link column-link--transparent' to='/suggestions'><Icon className='column-link__icon' id='user-plus' fixedWidth /><FormattedMessage id='navigation_bar.suggestions' defaultMessage='Suggestions' /></NavLink>
    <NavLink className='column-link column-link--transparent' to='/trends'><Icon className='column-link__icon' id='line-chart' fixedWidth /><FormattedMessage id='navigation_bar.trends' defaultMessage='Trends' /></NavLink>

    <ListPanel />
    <FavouriteDomainPanel />
    <FavouriteTagPanel />

    <hr />

    <a className='column-link column-link--transparent' href='/settings/preferences'><Icon className='column-link__icon' id='cog' fixedWidth /><FormattedMessage id='navigation_bar.preferences' defaultMessage='Preferences' /></a>
    <a className='column-link column-link--transparent' href='/relationships'><Icon className='column-link__icon' id='users' fixedWidth /><FormattedMessage id='navigation_bar.follows_and_followers' defaultMessage='Follows and followers' /></a>

    {showTrends && <div className='flex-spacer' />}
    {showTrends && <TrendsContainer />}
  </div>
);

export default withRouter(NavigationPanel);
