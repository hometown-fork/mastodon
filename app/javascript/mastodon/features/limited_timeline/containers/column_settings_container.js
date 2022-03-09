import { connect } from 'react-redux';
import ColumnSettings from '../components/column_settings';
import { changeSetting, saveSettings } from '../../../actions/settings';
import { clearTimeline } from '../../../actions/timelines';

const mapStateToProps = state => ({
  settings: state.getIn(['settings', 'limited']),
});

const mapDispatchToProps = dispatch => ({

  onChange (key, checked) {
    dispatch(changeSetting(['limited', ...key], checked));
  },

  onChangeClear (key, checked) {
    dispatch(changeSetting(['limited', ...key], checked));
    dispatch(clearTimeline('limited'));
  },

  onSave () {
    dispatch(saveSettings());
  },

});

export default connect(mapStateToProps, mapDispatchToProps)(ColumnSettings);
