import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { injectIntl, FormattedMessage } from 'react-intl';
import ScheduledDropDownContainer from '../containers/scheduled_dropdown_container';
import ExpiresDropDownContainer from '../containers/expires_dropdown_container';
import ExpiresActionContainer from '../containers/expires_action_container';

export default
@injectIntl
class DateTimeForm extends ImmutablePureComponent {

  static propTypes = {
    form_enable: PropTypes.bool.isRequired,
  };

  render () {
    const { form_enable } = this.props;

    if (!form_enable) {
      return null;
    }

    return (
      <div className='compose-form__datetime-wrapper'>
        <div className='datetime__schedule'>
        <div className='datetime__category'><FormattedMessage id='datetime.scheduled' defaultMessage='Scheduled' /></div>
          <ScheduledDropDownContainer />
        </div>
        <div className='datetime__expire'>
          <div className='datetime__category'><FormattedMessage id='datetime.expires' defaultMessage='Expires' /></div>
          <ExpiresDropDownContainer />
          <ExpiresActionContainer />
        </div>
      </div>
    );
  }

}
