import { connect } from 'react-redux';
import DateTimeDropdown from '../components/datetime_dropdown';
import { changeExpires } from '../../../actions/compose';
import { getDateTimeFromText } from '../../../actions/compose';
import { addDays, addSeconds, set } from 'date-fns'

const mapStateToProps = (state, { intl }) => {
  const valueKey = ['compose', 'expires'];
  const value = state.getIn(valueKey) ?? '';
  const scheduledAt = getDateTimeFromText(state.getIn(['compose', 'scheduled']), new Date()).at ?? new Date();

  return {
    value: value,
    valueKey: valueKey,
    origin: scheduledAt,
    minDate: addSeconds(scheduledAt, 60),
    maxDate: addSeconds(scheduledAt, 37152000),
    openToDate: set(addDays(scheduledAt, 1), { minutes: 0, seconds: 0 }),
  };
};

const mapDispatchToProps = (dispatch) => ({

  onChange (value) {
    dispatch(changeExpires(value));
  },

});

export default connect(mapStateToProps, mapDispatchToProps)(DateTimeDropdown);
