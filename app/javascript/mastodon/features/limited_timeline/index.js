import React from 'react';
import { connect } from 'react-redux';
import { expandLimitedTimeline } from '../../actions/timelines';
import PropTypes from 'prop-types';
import StatusListContainer from '../ui/containers/status_list_container';
import Column from '../../components/column';
import ColumnHeader from '../../components/column_header';
import { addColumn, removeColumn, moveColumn } from '../../actions/columns';
import { getLimitedVisibilities } from 'mastodon/selectors';
import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';
import ColumnSettingsContainer from './containers/column_settings_container';

const messages = defineMessages({
  title: { id: 'column.limited', defaultMessage: 'Limited' },
});

const mapStateToProps = state => ({
  hasUnread: state.getIn(['timelines', 'limited', 'unread']) > 0,
  visibilities: getLimitedVisibilities(state),
});

export default @connect(mapStateToProps)
@injectIntl
class LimitedTimeline extends React.PureComponent {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
    hasUnread: PropTypes.bool,
    visibilities: PropTypes.arrayOf(PropTypes.string),
    columnId: PropTypes.string,
    multiColumn: PropTypes.bool,
  };

  handlePin = () => {
    const { columnId, dispatch } = this.props;

    if (columnId) {
      dispatch(removeColumn(columnId));
    } else {
      dispatch(addColumn('LIMITED', {}));
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

  handleLoadMore = maxId => {
    const { dispatch, visibilities } = this.props;

    dispatch(expandLimitedTimeline({ maxId, visibilities }));
  }

  componentDidMount () {
    const { dispatch, visibilities } = this.props;

    dispatch(expandLimitedTimeline({ visibilities }));
  }

  componentDidUpdate (prevProps) {
    const { dispatch, visibilities } = this.props;

    if (prevProps.visibilities.toString() !== visibilities.toString()) {
      dispatch(expandLimitedTimeline({ visibilities }));
    }
  }

  render () {
    const { intl, hasUnread, columnId, multiColumn } = this.props;
    const pinned = !!columnId;

    return (
      <Column bindToDocument={!multiColumn} ref={this.setRef} label={intl.formatMessage(messages.title)}>
        <ColumnHeader
          icon='lock'
          active={hasUnread}
          title={intl.formatMessage(messages.title)}
          onPin={this.handlePin}
          onMove={this.handleMove}
          onClick={this.handleHeaderClick}
          pinned={pinned}
          multiColumn={multiColumn}
        >
          <ColumnSettingsContainer />
        </ColumnHeader>

        <StatusListContainer
          trackScroll={!pinned}
          scrollKey={`limited_timeline-${columnId}`}
          onLoadMore={this.handleLoadMore}
          timelineId='limited'
          emptyMessage={<FormattedMessage id='empty_column.limited' defaultMessage='Your limited timeline is empty.' />}
          bindToDocument={!multiColumn}
        />
      </Column>
    );
  }

}
