import React, { forwardRef } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { injectIntl, defineMessages } from 'react-intl';
import IconButton from 'mastodon/components/icon_button';
import { getDateTimeFromText } from 'mastodon/actions/compose';
import { layoutFromWindow } from 'mastodon/is_mobile';
import { openModal } from '../../../actions/modal';
import { Map as ImmutableMap, List as ImmutableList } from 'immutable';
import classNames from 'classnames'
import { format, minTime, maxTime, max } from 'date-fns'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const messages = defineMessages({
  datetime_open_calendar: { id: 'datetime.open_calendar', defaultMessage: 'Open calendar' },
  datetime_unset: { id: 'datetime.unset', defaultMessage: '(Unset)' },
  datetime_select: { id: 'datetime.select', defaultMessage: 'Select datetime' },
  datetime_time_subheading: { id: 'datetime.time_subheading', defaultMessage: 'Time' },
  datetime_placeholder: { id: 'datetime.placeholder', defaultMessage: 'Enter the date or duration' },
  minutes: { id: 'intervals.full.minutes', defaultMessage: '{number, plural, one {# minute} other {# minutes}}' },
  hours: { id: 'intervals.full.hours', defaultMessage: '{number, plural, one {# hour} other {# hours}}' },
  days: { id: 'intervals.full.days', defaultMessage: '{number, plural, one {# day} other {# days}}' },
  months: { id: 'intervals.full.months', defaultMessage: '{number, plural, one {# month} other {# months}}' },
  years: { id: 'intervals.full.years', defaultMessage: '{number, plural, one {# year} other {# years}}' },
  years_months: { id: 'intervals.full.years_months', defaultMessage: '{year, plural, one {# year} other {# years}} and {month, plural, one {# month} other {# months}}' },
});

const mapStateToProps = (state, { value, origin, minDate, maxDate }) => {
  const { at: valueAt, in: valueIn } = getDateTimeFromText(value, origin);
  const dateValue = typeof value === 'string' ? valueAt : value;
  const stringValue = typeof value === 'string' ? value : format(value, 'yyyy-MM-dd HH:mm');
  const invalid = !!value && (!valueIn && !valueAt || dateValue < (minDate ?? minTime) || (maxDate ?? maxTime) < dateValue);

  return {
    datetimePresets: state.get('datetimePresets'),
    dateValue: dateValue,
    stringValue: stringValue,
    invalid: invalid,
  }
};

export default @connect(mapStateToProps)
@injectIntl
class DateTimeDropdown extends React.PureComponent {

  static contextTypes = {
    router: PropTypes.object,
  };

  static propTypes = {
    presets: ImmutablePropTypes.list,
    value: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date),
    ]).isRequired,
    stringValue: PropTypes.string,
    dateValue: PropTypes.instanceOf(Date),
    invalid: PropTypes.bool.isRequired,
    origin: PropTypes.instanceOf(Date),
    minDate: PropTypes.instanceOf(Date),
    maxDate: PropTypes.instanceOf(Date),
    openToDate: PropTypes.instanceOf(Date),
    placeholder: PropTypes.string,
    className: PropTypes.string,
    id: PropTypes.string,
    valueKey: PropTypes.arrayOf(PropTypes.string).isRequired,
    onChange: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
  };

  static defaultProps = {
    origin: new Date(),
  };

  handleChange = e => {
    this.props.onChange(e.target.value);
    this.input.focus();
  };

  setInput = (c) => {
    this.input = c;
  }

  getDateTimePresets = () => {
    const { datetimePresets, intl } = this.props;
  
    if (!datetimePresets) {
      return ImmutableList([
        ImmutableMap({ id: '5m',  title: intl.formatMessage(messages.minutes, { number: 5 }) }),
        ImmutableMap({ id: '30m', title: intl.formatMessage(messages.minutes, { number: 30 }) }),
        ImmutableMap({ id: '1h',  title: intl.formatMessage(messages.hours, { number: 1 }) }),
        ImmutableMap({ id: '6h',  title: intl.formatMessage(messages.hours, { number: 6 }) }),
        ImmutableMap({ id: '1d',  title: intl.formatMessage(messages.days, { number: 1 }) }),
        ImmutableMap({ id: '3d',  title: intl.formatMessage(messages.days, { number: 3 }) }),
        ImmutableMap({ id: '7d',  title: intl.formatMessage(messages.days, { number: 7 }) }),
        ImmutableMap({ id: '1mo',  title: intl.formatMessage(messages.months, { number: 1 }) }),
        ImmutableMap({ id: '6mo',  title: intl.formatMessage(messages.months, { number: 6 }) }),
        ImmutableMap({ id: '1y',  title: intl.formatMessage(messages.years, { number: 1 }) }),
        ImmutableMap({ id: '1y1mo',  title: intl.formatMessage(messages.years_months, { year: 1, month: 1 }) }),
      ]);
    }
  
    return datetimePresets.toList();
  };

  onOpenCalendar = () => {
    const { valueKey, onChange, minDate, maxDate, openToDate, dispatch } = this.props

    dispatch(openModal('CALENDAR', {
      valueKey: valueKey,
      onChange: onChange,
      minDate: minDate,
      maxDate: maxDate,
      openToDate: openToDate,
    }));
  };

  render () {
    const { dateValue, stringValue, invalid, minDate, maxDate, openToDate, placeholder, id, className, onChange, intl } = this.props;
    const layout = layoutFromWindow();

    const CalendarIconButton = forwardRef(({ value, onClick }, ref) => (
      <IconButton icon='calendar' className='datetime-dropdown__calendar-icon' title={intl.formatMessage(messages.datetime_open_calendar)} style={{ width: 'auto', height: 'auto' }} onClick={onClick} ref={ref} />
    ));

    return (
      <div className='datetime-dropdown'>
        {layout === 'mobile' ?
          <IconButton icon='calendar' className='datetime-dropdown__calendar-icon' title={intl.formatMessage(messages.datetime_open_calendar)} style={{ width: 'auto', height: 'auto' }} onClick={this.onOpenCalendar} />
          :
          <DatePicker
            selected={max([dateValue ?? openToDate, minDate ?? minTime])}
            onChange={onChange}
            customInput={<CalendarIconButton />}
            minDate={minDate}
            maxDate={maxDate}
            timeInputLabel={intl.formatMessage(messages.datetime_time_subheading)}
            showTimeInput
            portalId='modal-root'
          />
        }

        <input
          type='text'
          ref={this.setInput}
          placeholder={placeholder ?? intl.formatMessage(messages.datetime_placeholder)}
          value={stringValue}
          onChange={this.handleChange}
          dir='auto'
          aria-autocomplete='list'
          id={id}
          className={classNames('datetime-dropdown__input', className, { 'datetime-dropdown__input-invalid': invalid })}
        />

        <select className='datetime-dropdown__menu' title={intl.formatMessage(messages.datetime_select)} value={stringValue} onChange={this.handleChange}>
          <option value={stringValue} key='default'></option>
          <option value='' key='unset'>{intl.formatMessage(messages.datetime_unset)}</option>
          {this.getDateTimePresets().map(item =>
            <option value={item.get('id')} key={item.get('id')}>{item.get('title')}</option>,
          )}
        </select>
      </div>
    );
  }

}
