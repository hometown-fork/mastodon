import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { fetchSuggestions, dismissSuggestion } from 'mastodon/actions/suggestions';
import Column from '../ui/components/column';
import ColumnHeader from '../../components/column_header';
import ColumnSubheading from '../ui/components/column_subheading';
import { addColumn, removeColumn, moveColumn } from '../../actions/columns';
import ScrollableList from 'mastodon/components/scrollable_list';
import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';
import AccountContainer from 'mastodon/containers/account_container';
import ImmutablePureComponent from 'react-immutable-pure-component';

const messages = defineMessages({
  heading: { id: 'suggestions.heading', defaultMessage: 'Suggestions' },
  subheading: { id: 'suggestions.header', defaultMessage: 'You might be interested in…' },
  dismissSuggestion: { id: 'suggestions.dismiss', defaultMessage: 'Dismiss suggestion' },
});

const mapStateToProps = state => ({
  suggestions: state.getIn(['suggestions', 'items']),
  isLoading: state.getIn(['suggestions', 'isLoading'], true),
});

export default @connect(mapStateToProps)
@injectIntl
class Suggestions extends ImmutablePureComponent {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    suggestions: ImmutablePropTypes.list.isRequired,
    intl: PropTypes.object.isRequired,
    columnId: PropTypes.string,
    multiColumn: PropTypes.bool,
    isLoading: PropTypes.bool,
  };

  componentDidMount () {
    this.fetchSuggestions();
  }

  fetchSuggestions = () => {
    const { dispatch } = this.props;

    dispatch(fetchSuggestions());
  }

  dismissSuggestion = account => {
    const { dispatch } = this.props;

    dispatch(dismissSuggestion(account.get('id')));
  }

  handlePin = () => {
    const { columnId, dispatch } = this.props;

    if (columnId) {
      dispatch(removeColumn(columnId));
    } else {
      dispatch(addColumn('SUGGESTIONS', {}));
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
    const { intl, suggestions, columnId, multiColumn, isLoading } = this.props;
    const pinned = !!columnId;

    const emptyMessage = <FormattedMessage id='empty_column.suggestions' defaultMessage='No one has suggestions yet.' />;

    return (
      <Column bindToDocument={!multiColumn} ref={this.setRef} label={intl.formatMessage(messages.heading)}>
        <ColumnHeader
          icon='user-plus'
          title={intl.formatMessage(messages.heading)}
          onPin={this.handlePin}
          onMove={this.handleMove}
          onClick={this.handleHeaderClick}
          pinned={pinned}
          multiColumn={multiColumn}
          showBackButton
        />

        <ScrollableList
          trackScroll={!pinned}
          scrollKey={`suggestions-${columnId}`}
          isLoading={isLoading}
          emptyMessage={emptyMessage}
          prepend={<ColumnSubheading text={intl.formatMessage(messages.subheading)} />}
          bindToDocument={!multiColumn}
        >
          {suggestions && suggestions.map(suggestion => (
            <AccountContainer
              key={suggestion.get('account')}
              id={suggestion.get('account')}
              actionIcon={suggestion.get('source') === 'past_interaction' ? 'times' : null}
              actionTitle={suggestion.get('source') === 'past_interaction' ? intl.formatMessage(messages.dismissSuggestion) : null}
              onActionClick={dismissSuggestion}
            />
          ))}
        </ScrollableList>
      </Column>
    );
  }

}
