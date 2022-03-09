import React from 'react';
import IconButton from '../../../components/icon_button';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';

const messages = defineMessages({
  add_datetime: { id: 'datetime_button.add_datetime', defaultMessage: 'Add datetime' },
  remove_datetime: { id: 'datetime_button.remove_datetime', defaultMessage: 'Remove datetime' },
});

const iconStyle = {
  height: null,
  lineHeight: '27px',
};

export default
@injectIntl
class DateTimeButton extends React.PureComponent {

  static propTypes = {
    disabled: PropTypes.bool,
    active: PropTypes.bool,
    onClick: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
  };

  handleClick = () => {
    this.props.onClick();
  }

  render () {
    const { intl, active, disabled } = this.props;

    return (
      <div className='compose-form__datetime-button'>
        <IconButton
          icon='calendar'
          title={intl.formatMessage(active ? messages.remove_datetime : messages.add_datetime)}
          disabled={disabled}
          onClick={this.handleClick}
          className={`compose-form__datetime-button-icon ${active ? 'active' : ''}`}
          size={18}
          inverted
          style={iconStyle}
        />
      </div>
    );
  }

}
