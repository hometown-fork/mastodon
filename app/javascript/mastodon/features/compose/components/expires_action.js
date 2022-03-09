import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages } from 'react-intl';
import RadioButton from 'mastodon/components/radio_button';

const messages = defineMessages({
  expires_mark: { id: 'datetime.expires_action.mark', defaultMessage: 'Mark as expired' },
  expires_delete: { id: 'datetime.expires_action.delete', defaultMessage: 'Delete' },
});

export default @injectIntl
class ExpiresAction extends React.PureComponent {

  static propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
  };

  handleChange = e => {
    this.props.onChange(e.target.value);
  };

  render () {
    const { value, intl } = this.props;

    return (
      <div className='datetime-action' role='group'>
        <RadioButton name='expires_action' value='mark' label={intl.formatMessage(messages.expires_mark)} checked={value === 'mark'} onChange={this.handleChange} />
        <RadioButton name='expires_action' value='delete' label={intl.formatMessage(messages.expires_delete)} checked={value === 'delete'} onChange={this.handleChange} />
      </div>
    );
  }

}
