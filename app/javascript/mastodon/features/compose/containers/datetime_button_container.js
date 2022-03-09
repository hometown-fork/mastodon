import { connect } from 'react-redux';
import DateTimeButton from '../components/datetime_button';
import { addDateTime, removeDateTime } from '../../../actions/compose';

const mapStateToProps = state => ({
  active: state.getIn(['compose', 'datetime_form']) !== null,
});

const mapDispatchToProps = dispatch => ({

  onClick () {
    dispatch((_, getState) => {
      if (getState().getIn(['compose', 'datetime_form'])) {
        dispatch(removeDateTime());
      } else {
        dispatch(addDateTime());
      }
    });
  },

});

export default connect(mapStateToProps, mapDispatchToProps)(DateTimeButton);
