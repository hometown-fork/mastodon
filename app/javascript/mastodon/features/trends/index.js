import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { fetchTrends } from '../../actions/trends';
import Column from '../ui/components/column';
import ColumnHeader from '../../components/column_header';
import ColumnSubheading from '../ui/components/column_subheading';
import Icon from 'mastodon/components/icon';
import { addColumn, removeColumn, moveColumn } from '../../actions/columns';
import ScrollableList from 'mastodon/components/scrollable_list';
import Hashtag from 'mastodon/components/hashtag';
import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';
import ImmutablePureComponent from 'react-immutable-pure-component';

const messages = defineMessages({
  heading: { id: 'trends.heading', defaultMessage: 'Trends' },
  subheading: { id: 'trends.trending_now', defaultMessage: 'Trending now' },
  refresh: { id: 'refresh', defaultMessage: 'Refresh' },
});

const mapStateToProps = state => ({
  trends: state.getIn(['trends', 'items']),
  isLoading: state.getIn(['trends', 'isLoading'], true),
});

export default @connect(mapStateToProps)
@injectIntl
class Trends extends ImmutablePureComponent {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    trends: ImmutablePropTypes.list,
    intl: PropTypes.object.isRequired,
    columnId: PropTypes.string,
    multiColumn: PropTypes.bool,
    isLoading: PropTypes.bool,
  };

  componentDidMount () {
    this.fetchTrends();
    this.refreshInterval = setInterval(() => this.fetchTrends(), 900 * 1000);
  }

  componentWillUnmount () {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  handleRefresh = () => {
    this.fetchTrends();
  }

  fetchTrends = () => {
    const { dispatch } = this.props;

    dispatch(fetchTrends());
  }

  handlePin = () => {
    const { columnId, dispatch } = this.props;

    if (columnId) {
      dispatch(removeColumn(columnId));
    } else {
      dispatch(addColumn('TRENDS', {}));
    }
  }

  handleMove = (dir) => {
    const { columnId, dispatch } = this.props;
    dispatch(moveColumn(columnId, dir));
  }

  handleHeaderClick = () => {
    this.column.scrollTop();
  }

  setRef = c => {
    this.column = c;
  }

  render () {
    const { intl, trends, columnId, multiColumn, isLoading } = this.props;
    const pinned = !!columnId;

    const emptyMessage = <FormattedMessage id='empty_column.trends' defaultMessage='No one has trends yet.' />;

    return (
      <Column bindToDocument={!multiColumn} ref={this.setRef} label={intl.formatMessage(messages.heading)}>
        <ColumnHeader
          icon='line-chart'
          title={intl.formatMessage(messages.heading)}
          onPin={this.handlePin}
          onMove={this.handleMove}
          onClick={this.handleHeaderClick}
          pinned={pinned}
          multiColumn={multiColumn}
          showBackButton
          extraButton={(
            <button className='column-header__button' title={intl.formatMessage(messages.refresh)} aria-label={intl.formatMessage(messages.refresh)} onClick={this.handleRefresh}><Icon id='refresh' /></button>
          )}
        />

        <ScrollableList
          trackScroll={!pinned}
          scrollKey={`trends-${columnId}`}
          isLoading={isLoading}
          emptyMessage={emptyMessage}
          prepend={<ColumnSubheading text={intl.formatMessage(messages.subheading)} />}
          bindToDocument={!multiColumn}
        >
          {trends.map(hashtag =>
            <Hashtag key={hashtag.get('name')} hashtag={hashtag} />,
          )}
        </ScrollableList>
      </Column>
    );
  }

}
