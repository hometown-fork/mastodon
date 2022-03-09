import { connect } from 'react-redux';
import DateTimeDropdown from '../components/datetime_dropdown';
import { changeScheduled } from '../../../actions/compose';
import { addDays, addSeconds, set } from 'date-fns'

const mapStateToProps = state => {
  const valueKey = ['compose', 'scheduled'];
  const value = state.getIn(valueKey) ?? '';

  return {
    value: value,
    valueKey: valueKey,
    minDate: addSeconds(new Date(), 300),
    openToDate: set(addDays(new Date(), 1), { minutes: 0, seconds: 0 }),
  };
};

const mapDispatchToProps = dispatch => ({

  onChange (value) {
    dispatch(changeScheduled(value));
  },

});

export default connect(mapStateToProps, mapDispatchToProps)(DateTimeDropdown);
