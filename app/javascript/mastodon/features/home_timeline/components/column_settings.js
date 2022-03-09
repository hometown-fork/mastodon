import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { injectIntl, FormattedMessage } from 'react-intl';
import SettingToggle from '../../notifications/components/setting_toggle';
import { enable_limited_timeline } from 'mastodon/initial_state';

export default @injectIntl
class ColumnSettings extends React.PureComponent {

  static propTypes = {
    settings: ImmutablePropTypes.map.isRequired,
    onChange: PropTypes.func.isRequired,
    onChangeClear: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
  };

  render () {
    const { settings, onChange, onChangeClear } = this.props;

    return (
      <div>
        <span className='column-settings__section'><FormattedMessage id='home.column_settings.basic' defaultMessage='Basic' /></span>

        <div className='column-settings__row'>
          <SettingToggle prefix='home_timeline' settings={settings} settingPath={['shows', 'reblog']} onChange={onChange} label={<FormattedMessage id='home.column_settings.show_reblogs' defaultMessage='Show boosts' />} />
        </div>

        <div className='column-settings__row'>
          <SettingToggle prefix='home_timeline' settings={settings} settingPath={['shows', 'reply']} onChange={onChange} label={<FormattedMessage id='home.column_settings.show_replies' defaultMessage='Show replies' />} />
        </div>

        {enable_limited_timeline && <Fragment>
          <span className='column-settings__section'><FormattedMessage id='home.column_settings.visibility' defaultMessage='Visibility' /></span>

          <div className='column-settings__row'>
            <SettingToggle prefix='home_timeline' settings={settings} settingPath={['shows', 'private']} onChange={onChangeClear} label={<FormattedMessage id='home.column_settings.show_private' defaultMessage='Show private' />} />
          </div>

          <div className='column-settings__row'>
            <SettingToggle prefix='home_timeline' settings={settings} settingPath={['shows', 'limited']} onChange={onChangeClear} label={<FormattedMessage id='home.column_settings.show_limited' defaultMessage='Show limited' />} />
          </div>

          <div className='column-settings__row'>
            <SettingToggle prefix='home_timeline' settings={settings} settingPath={['shows', 'direct']} onChange={onChangeClear} label={<FormattedMessage id='home.column_settings.show_direct' defaultMessage='Show direct' />} />
          </div>
        </Fragment>}
      </div>
    );
  }

}
