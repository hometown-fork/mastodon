import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { injectIntl, defineMessages } from 'react-intl';
import { getDateTimeFromText } from 'mastodon/actions/compose';
import { minTime, max } from 'date-fns'

import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

const messages = defineMessages({
  datetime_time_subheading: { id: 'datetime.time_subheading', defaultMessage: 'Time' },
});

const mapStateToProps = (state, { valueKey, origin, openToDate, minDate }) => {
  const value = state.getIn(valueKey);
  const dateValue = typeof value === 'string' ? getDateTimeFromText(value, origin).at : value;

  return {
    // selected: dateValue ?? openToDate,
    selected: max([dateValue ?? openToDate, minDate ?? minTime]),
  }
};

export default @connect(mapStateToProps, null, null, { forwardRef: true })
@injectIntl
class CalendarModal extends ImmutablePureComponent {

  static propTypes = {
    selected: PropTypes.instanceOf(Date),
    minDate: PropTypes.instanceOf(Date),
    maxDate: PropTypes.instanceOf(Date),
    onChange: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
  };

  handleChange = (value) => {
    this.props.onChange(value);
  };

  handleSelect = () => {
    this.props.onClose();
  };

  render () {
    const { selected, minDate, maxDate, intl } = this.props;

    return (
      <div className='modal-root__modal calendar-modal'>
        <div className='calendar-modal__container'>
          <DatePicker
            selected={selected}
            onChange={this.handleChange}
            onSelect={this.handleSelect}
            minDate={minDate}
            maxDate={maxDate}
            timeInputLabel={intl.formatMessage(messages.datetime_time_subheading)}
            showTimeInput
            inline
          />
        </div>
      </div>
    );
  }

}
