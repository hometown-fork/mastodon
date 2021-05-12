import { connect } from 'react-redux';
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import { invitesEnabled, version, repository, source_url } from 'mastodon/initial_state';
import { logOut } from 'mastodon/utils/log_out';
import { openModal } from 'mastodon/actions/modal';

const messages = defineMessages({
  logoutMessage: { id: 'confirmations.logout.message', defaultMessage: 'Are you sure you want to log out?' },
  logoutConfirm: { id: 'confirmations.logout.confirm', defaultMessage: 'Log out' },
});

const mapDispatchToProps = (dispatch, { intl }) => ({
  onLogout () {
    dispatch(openModal('CONFIRM', {
      message: intl.formatMessage(messages.logoutMessage),
      confirm: intl.formatMessage(messages.logoutConfirm),
      onConfirm: () => logOut(),
    }));
  },
});

export default @injectIntl
@connect(null, mapDispatchToProps)
class LinkFooter extends React.PureComponent {

  static propTypes = {
    withHotkeys: PropTypes.bool,
    onLogout: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
  };

  handleLogoutClick = e => {
    e.preventDefault();
    e.stopPropagation();

    this.props.onLogout();

    return false;
  }

  render () {
    const { withHotkeys } = this.props;

    return (
      <div className='getting-started__footer_container'>
        <div className='getting-started__footer'>
          <p>
            Welcome to Queer Haus! Don't be shy, click around, explore, and please read <a href="http://queer.haus/about/more">our about page that explains the basics</a>.
          </p>
          <p>
            If something looks broken, send us a message.
            You can reach us at our collective account <a href="https://queer.haus/web/accounts/191">@dolphin</a> or our personal accounts:<br/>
            <a href="https://queer.haus/web/accounts/5">@exstral</a> <a href="https://queer.haus/web/accounts/166">@vincentreynaud</a> <a href="https://queer.haus/web/accounts/167">@RustySofa</a> <a href="https://queer.haus/web/accounts/234">@monkysoda</a> <a href="https://queer.haus/web/accounts/302">@blablablorges</a> <a href="https://queer.haus/web/accounts/304">@marum</a>
          </p>
          <p>
            Let’s communicate and organise! 🔥
          </p>

          <ul>
            <li><a href='/about/more' target='_blank'>About us</a> · </li>
            <li><a href='https://opencollective.com/queerhaus' target='_blank'><FormattedMessage id='getting_started.donate' defaultMessage='Donate' /></a> · </li>
            <li><a href='https://matrix.to/#/#queerhaus:matrix.org?via=matrix.org' target='_blank'>Chat</a> · </li>
            <li><a href='/about/more#apps-on-mobile' target='_blank'>Mobile&nbsp;apps</a> · </li>
            <li><a href='/terms' target='_blank'><FormattedMessage id='getting_started.terms' defaultMessage='Terms of service' /></a> · </li>
            <li><a href='https://docs.joinmastodon.org' target='_blank'><FormattedMessage id='getting_started.documentation' defaultMessage='Documentation' /></a> · </li>
            <li><a href='/auth/sign_out' onClick={this.handleLogoutClick}><FormattedMessage id='navigation_bar.logout' defaultMessage='Logout' /></a></li>
          </ul>

          <p>
            <span>logo by Landon Whittaker</span><br/>
            <span>all our projects are <a rel='noopener noreferrer' href='https://github.com/queerhaus'>open source</a></span>
          </p>
        </div>
      </div>
    );
  }

};
