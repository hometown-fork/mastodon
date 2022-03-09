import { connect } from 'react-redux';
import DateTimeForm from '../components/datetime_form';

const mapStateToProps = state => ({
  form_enable: !!state.getIn(['compose', 'datetime_form']),
});

export default connect(mapStateToProps)(DateTimeForm);
