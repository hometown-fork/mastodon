import { connect } from 'react-redux';
import ColumnsArea from '../components/columns_area';
import { getSwipeableLinks, getFavouriteOrderedLists } from '../components/tabs_bar';

const mapStateToProps = state => {
  const favouriteLists = getFavouriteOrderedLists(state)

  return {
    columns: state.getIn(['settings', 'columns']),
    isModalOpen: !!state.get('modal').modalType,
    favouriteLists: favouriteLists,
    links: getSwipeableLinks(favouriteLists),
  };
};

export default connect(mapStateToProps, null, null, { forwardRef: true })(ColumnsArea);
