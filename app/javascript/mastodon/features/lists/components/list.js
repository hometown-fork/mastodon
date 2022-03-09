import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import classNames from 'classnames';
import Icon from '../../../components/icon';
import ColumnLink from 'mastodon/features/ui/components/column_link';
import { openModal } from '../../../actions/modal';
import { favouriteList, unfavouriteList } from '../../../actions/lists';

const messages = defineMessages({
  favourite: { id: 'lists.favourite', defaultMessage: 'Favourite list' },
  edit: { id: 'lists.edit', defaultMessage: 'Edit list' },
});

export default @connect()
@injectIntl
class List extends React.PureComponent {

  static propTypes = {
    id: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    favourite: PropTypes.bool.isRequired,
    animate: PropTypes.bool,
    dispatch: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
  };

  static defaultProps = {
    animate: false,
  };

  state = {
    activate: false,
    deactivate: false,
  }

  componentWillReceiveProps (nextProps) {
    if (!nextProps.animate) return;

    if (this.props.favourite && !nextProps.favourite) {
      this.setState({ activate: false, deactivate: true });
    } else if (!this.props.favourite && nextProps.favourite) {
      this.setState({ activate: true, deactivate: false });
    }
  }

  handleEditClick = () => {
    this.props.dispatch(openModal('LIST_EDITOR', { listId: this.props.id }));
  }

  handleFavouriteClick = () => {
    const { id, favourite, dispatch } = this.props;

    if (favourite) {
      dispatch(unfavouriteList(id));
    } else {
      dispatch(favouriteList(id));
    }
  }

  render() {
    const { id, text, favourite, intl } = this.props;
    const { activate, deactivate } = this.state;

    return (
      <div className='list-link'>
        <div className='list-name'><ColumnLink to={`/timelines/list/${id}`} icon='list-ul' text={text} /></div>
        <button className={classNames('list-favourite-button icon-button star-icon', {active: favourite, pressed: favourite, activate, deactivate})} title={intl.formatMessage(messages.favourite)} onClick={this.handleFavouriteClick}>
          <Icon id='star' className='column-link__icon' fixedWidth />
        </button>
        <button className='list-edit-button' title={intl.formatMessage(messages.edit)} onClick={this.handleEditClick}>
          <Icon id='pencil' className='column-link__icon' fixedWidth />
        </button>
      </div>
    );
  }

}
