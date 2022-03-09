import React from 'react';
import { connect } from 'react-redux';
import { defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import Column from 'mastodon/components/column';
import ColumnHeader from 'mastodon/components/column_header';
import { addColumn, removeColumn, moveColumn, changeColumnParams } from 'mastodon/actions/columns';
import { fetchGroupDirectory, expandGroupDirectory } from 'mastodon/actions/group_directory';
import { List as ImmutableList } from 'immutable';
import AccountCard from './components/account_card';
import RadioButton from 'mastodon/components/radio_button';
import classNames from 'classnames';
import LoadMore from 'mastodon/components/load_more';
import { ScrollContainer } from 'react-router-scroll-4';

const messages = defineMessages({
  title: { id: 'column.group_directory', defaultMessage: 'Browse groups' },
  recentlyActive: { id: 'group_directory.recently_active', defaultMessage: 'Recently active' },
  newArrivals: { id: 'group_directory.new_arrivals', defaultMessage: 'New arrivals' },
});

const mapStateToProps = state => ({
  accountIds: state.getIn(['user_lists', 'group_directory', 'items'], ImmutableList()),
  isLoading: state.getIn(['user_lists', 'group_directory', 'isLoading'], true),
});

export default @connect(mapStateToProps)
@injectIntl
class GroupDirectory extends React.PureComponent {

  static contextTypes = {
    router: PropTypes.object,
  };

  static propTypes = {
    isLoading: PropTypes.bool,
    accountIds: ImmutablePropTypes.list.isRequired,
    dispatch: PropTypes.func.isRequired,
    columnId: PropTypes.string,
    intl: PropTypes.object.isRequired,
    multiColumn: PropTypes.bool,
    params: PropTypes.shape({
      order: PropTypes.string,
    }),
  };

  state = {
    order: null,
    local: null,
  };

  handlePin = () => {
    const { columnId, dispatch } = this.props;

    if (columnId) {
      dispatch(removeColumn(columnId));
    } else {
      dispatch(addColumn('GROUP_DIRECTORY', this.getParams(this.props, this.state)));
    }
  }

  getParams = (props, state) => ({
    order: state.order === null ? (props.params.order || 'active') : state.order,
  });

  handleMove = dir => {
    const { columnId, dispatch } = this.props;
    dispatch(moveColumn(columnId, dir));
  }

  handleHeaderClick = () => {
    this.column.scrollTop();
  }

  componentDidMount () {
    const { dispatch } = this.props;
    dispatch(fetchGroupDirectory(this.getParams(this.props, this.state)));
  }

  componentDidUpdate (prevProps, prevState) {
    const { dispatch } = this.props;
    const paramsOld = this.getParams(prevProps, prevState);
    const paramsNew = this.getParams(this.props, this.state);

    if (paramsOld.order !== paramsNew.order || paramsOld.local !== paramsNew.local) {
      dispatch(fetchGroupDirectory(paramsNew));
    }
  }

  setRef = c => {
    this.column = c;
  }

  handleChangeOrder = e => {
    const { dispatch, columnId } = this.props;

    if (columnId) {
      dispatch(changeColumnParams(columnId, ['order'], e.target.value));
    } else {
      this.setState({ order: e.target.value });
    }
  }

  handleLoadMore = () => {
    const { dispatch } = this.props;
    dispatch(expandGroupDirectory(this.getParams(this.props, this.state)));
  }

  render () {
    const { isLoading, accountIds, intl, columnId, multiColumn } = this.props;
    const { order }  = this.getParams(this.props, this.state);
    const pinned = !!columnId;

    const scrollableArea = (
      <div className='scrollable' style={{ background: 'transparent' }}>
        <div className='filter-form'>
          <div className='filter-form__column' role='group'>
            <RadioButton name='order' value='active' label={intl.formatMessage(messages.recentlyActive)} checked={order === 'active'} onChange={this.handleChangeOrder} />
            <RadioButton name='order' value='new' label={intl.formatMessage(messages.newArrivals)} checked={order === 'new'} onChange={this.handleChangeOrder} />
          </div>
        </div>

        <div className={classNames('directory__list', { loading: isLoading })}>
          {accountIds.map(accountId => <AccountCard id={accountId} key={accountId} />)}
        </div>

        <LoadMore onClick={this.handleLoadMore} visible={!isLoading} />
      </div>
    );

    return (
      <Column bindToDocument={!multiColumn} ref={this.setRef} label={intl.formatMessage(messages.title)}>
        <ColumnHeader
          icon='address-book-o'
          title={intl.formatMessage(messages.title)}
          onPin={this.handlePin}
          onMove={this.handleMove}
          onClick={this.handleHeaderClick}
          pinned={pinned}
          multiColumn={multiColumn}
        />

        {multiColumn && !pinned ? <ScrollContainer scrollKey='group_directory'>{scrollableArea}</ScrollContainer> : scrollableArea}
      </Column>
    );
  }

}
