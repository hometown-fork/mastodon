import { connect } from 'react-redux';
import ExpiresAction from '../components/expires_action';
import { changeExpiresAction } from '../../../actions/compose';

const mapStateToProps = state => ({
  value: state.getIn(['compose', 'expires_action']) ?? '',
});

const mapDispatchToProps = dispatch => ({

  onChange (value) {
    dispatch(changeExpiresAction(value));
  },

});

export default connect(mapStateToProps, mapDispatchToProps)(ExpiresAction);
