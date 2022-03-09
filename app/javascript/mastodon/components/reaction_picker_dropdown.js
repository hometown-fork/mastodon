import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import IconButton from './icon_button';
import Overlay from 'react-overlays/lib/Overlay';
import Motion from '../features/ui/util/optional_motion';
import spring from 'react-motion/lib/spring';
import { supportsPassiveEvents } from 'detect-passive-events';

import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';
import { EmojiPicker as EmojiPickerAsync } from '../features/ui/util/async-components';
import { buildCustomEmojis, categoriesFromEmojis } from '../features/emoji/emoji';
import { assetHost } from 'mastodon/utils/config';

const messages = defineMessages({
    emoji: { id: 'emoji_button.label', defaultMessage: 'Insert emoji' },
    emoji_search: { id: 'emoji_button.search', defaultMessage: 'Search...' },
    emoji_not_found: { id: 'emoji_button.not_found', defaultMessage: 'No emojos!! (╯°□°）╯︵ ┻━┻' },
    custom: { id: 'emoji_button.custom', defaultMessage: 'Custom' },
    recent: { id: 'emoji_button.recent', defaultMessage: 'Frequently used' },
    search_results: { id: 'emoji_button.search_results', defaultMessage: 'Search results' },
    people: { id: 'emoji_button.people', defaultMessage: 'People' },
    nature: { id: 'emoji_button.nature', defaultMessage: 'Nature' },
    food: { id: 'emoji_button.food', defaultMessage: 'Food & Drink' },
    activity: { id: 'emoji_button.activity', defaultMessage: 'Activity' },
    travel: { id: 'emoji_button.travel', defaultMessage: 'Travel & Places' },
    objects: { id: 'emoji_button.objects', defaultMessage: 'Objects' },
    symbols: { id: 'emoji_button.symbols', defaultMessage: 'Symbols' },
    flags: { id: 'emoji_button.flags', defaultMessage: 'Flags' },
});

const listenerOptions = supportsPassiveEvents ? { passive: true } : false;
let id = 100;

let EmojiPicker, Emoji; // load asynchronously

const backgroundImageFn = () => `${assetHost}/emoji/sheet_13.png`;

const notFoundFn = () => (
  <div className='emoji-mart-no-results'>
    <Emoji
      emoji='sleuth_or_spy'
      set='twitter'
      size={32}
      sheetSize={32}
      backgroundImageFn={backgroundImageFn}
    />

    <div className='emoji-mart-no-results-label'>
      <FormattedMessage id='emoji_mart_button.not_found' defaultMessage='No matching emojis found' />
    </div>
  </div>
);

@injectIntl
class ReactionPicker extends React.PureComponent {

  static propTypes = {
    intl: PropTypes.object.isRequired,
    custom_emojis: ImmutablePropTypes.list,
    onPickEmoji: PropTypes.func.isRequired,
    onSkinTone: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    skinTone: PropTypes.number.isRequired,
    frequentlyUsedEmojis: PropTypes.arrayOf(PropTypes.string),
    loading: PropTypes.bool,
    style: PropTypes.object,
    placement: PropTypes.string,
    arrowOffsetLeft: PropTypes.string,
    arrowOffsetTop: PropTypes.string,
  };

  static defaultProps = {
    style: {},
    loading: true,
    frequentlyUsedEmojis: [],
  };

  state = {
    modifierOpen: false,
    placement: null,
  };

  handleDocumentClick = e => {
    if (this.node && !this.node.contains(e.target)) {
      this.props.onClose();
    }
  }

  componentDidMount () {
    document.addEventListener('click', this.handleDocumentClick, false);
    document.addEventListener('touchend', this.handleDocumentClick, listenerOptions);
  }

  componentWillUnmount () {
    document.removeEventListener('click', this.handleDocumentClick, false);
    document.removeEventListener('touchend', this.handleDocumentClick, listenerOptions);
  }

  setRef = c => {
    this.node = c;
  }

  getI18n = () => {
    const { intl } = this.props;

    return {
      search: intl.formatMessage(messages.emoji_search),
      notfound: intl.formatMessage(messages.emoji_not_found),
      categories: {
        search: intl.formatMessage(messages.search_results),
        recent: intl.formatMessage(messages.recent),
        people: intl.formatMessage(messages.people),
        nature: intl.formatMessage(messages.nature),
        foods: intl.formatMessage(messages.food),
        activity: intl.formatMessage(messages.activity),
        places: intl.formatMessage(messages.travel),
        objects: intl.formatMessage(messages.objects),
        symbols: intl.formatMessage(messages.symbols),
        flags: intl.formatMessage(messages.flags),
        custom: intl.formatMessage(messages.custom),
      },
    };
  }

  handleClick = (emoji, event) => {
    if (!emoji.native) {
      emoji.native = emoji.colons;
    }
    if (!(event.ctrlKey || event.metaKey)) {
      this.props.onClose();
    }
    this.props.onPickEmoji(emoji);
  }

  handleModifierOpen = () => {
    this.setState({ modifierOpen: true });
  }

  handleModifierClose = () => {
    this.setState({ modifierOpen: false });
  }

  handleModifierChange = modifier => {
    this.props.onSkinTone(modifier);
  }

  render () {
    const { loading, style, intl, custom_emojis, skinTone, frequentlyUsedEmojis } = this.props;

    if (loading) {
      return <div style={{height: 349,width: 299}} />;
    }

    const title = intl.formatMessage(messages.emoji);

    const { modifierOpen } = this.state;

    const categoriesSort = [
      'recent',
      'people',
      'nature',
      'foods',
      'activity',
      'places',
      'objects',
      'symbols',
      'flags',
    ];

    categoriesSort.splice(1, 0, ...Array.from(categoriesFromEmojis(custom_emojis)).sort());

    return (
        <EmojiPicker
          perLine={8}
          emojiSize={22}
          sheetSize={32}
          custom={buildCustomEmojis(custom_emojis)}
          color=''
          emoji=''
          set='twitter'
          title={title}
          i18n={this.getI18n()}
          onClick={this.handleClick}
          include={categoriesSort}
          recent={frequentlyUsedEmojis}
          skin={skinTone}
          showPreview={false}
          showSkinTones={false}
          notFound={notFoundFn}
          autoFocus
          emojiTooltip
        />
    );
  }
}

class ReactionPickerDropdownMenu extends React.PureComponent {

  static contextTypes = {
    router: PropTypes.object,
  };

  static propTypes = {
    onClose: PropTypes.func.isRequired,
    style: PropTypes.object,
    placement: PropTypes.string,
    arrowOffsetLeft: PropTypes.string,
    arrowOffsetTop: PropTypes.string,
    openedViaKeyboard: PropTypes.bool,
    custom_emojis: ImmutablePropTypes.list,
    onPickEmoji: PropTypes.func.isRequired,
    onSkinTone: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    skinTone: PropTypes.number.isRequired,
    frequentlyUsedEmojis: PropTypes.arrayOf(PropTypes.string),

  };

  static defaultProps = {
    style: {},
    placement: 'bottom',
  };

  state = {
    mounted: false,
    loading: true,
  };

  handleDocumentClick = e => {
    if (this.node && !this.node.contains(e.target)) {
      this.props.onClose();
    }
  }

  componentDidMount () {
    document.addEventListener('click', this.handleDocumentClick, false);
    document.addEventListener('keydown', this.handleKeyDown, false);
    document.addEventListener('touchend', this.handleDocumentClick, listenerOptions);
    this.setState({ mounted: true });
    this.setState({ loading: true });
    EmojiPickerAsync().then(EmojiMart => {
      EmojiPicker = EmojiMart.Picker;
      Emoji       = EmojiMart.Emoji;
      this.setState({ loading: false });
    }).catch(() => {
      this.setState({ loading: false });
    });
  }

  componentWillUnmount () {
    document.removeEventListener('click', this.handleDocumentClick, false);
    document.removeEventListener('keydown', this.handleKeyDown, false);
    document.removeEventListener('touchend', this.handleDocumentClick, listenerOptions);
  }

  setRef = c => {
    this.node = c;
  }

  render () {
    const { onClose, style, placement, arrowOffsetLeft, arrowOffsetTop } = this.props;
    const { custom_emojis, onPickEmoji, onSkinTone, skinTone, frequentlyUsedEmojis } = this.props;
    const { mounted, loading } = this.state;

    return (
      <Motion defaultStyle={{ opacity: 0, scaleX: 0.85, scaleY: 0.75 }} style={{ opacity: spring(1, { damping: 35, stiffness: 400 }), scaleX: spring(1, { damping: 35, stiffness: 400 }), scaleY: spring(1, { damping: 35, stiffness: 400 }) }}>
        {({ opacity, scaleX, scaleY }) => (
          // It should not be transformed when mounting because the resulting
          // size will be used to determine the coordinate of the menu by
          // react-overlays
          <div className={`dropdown-menu dropdown-menu-reaction ${placement}`} style={{ ...style, opacity: opacity, transform: mounted ? `scale(${scaleX}, ${scaleY})` : null }} ref={this.setRef}>
            <div className={`dropdown-menu__arrow ${placement}`} style={{ left: arrowOffsetLeft, top: arrowOffsetTop }} />
            <ReactionPicker
              custom_emojis={custom_emojis}
              loading={loading}
              onClose={onClose}
              onPickEmoji={onPickEmoji}
              onSkinTone={onSkinTone}
              skinTone={skinTone}
              frequentlyUsedEmojis={frequentlyUsedEmojis}
            />
          </div>
        )}
      </Motion>
    );
  }

}

export default class ReactionPickerDropdown extends React.PureComponent {

  static contextTypes = {
    router: PropTypes.object,
  };

  static propTypes = {
    icon: PropTypes.string.isRequired,
    size: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    active: PropTypes.bool,
    pressed: PropTypes.bool,
    iconButtonClass: PropTypes.string,
    disabled: PropTypes.bool,
    status: ImmutablePropTypes.map,
    isUserTouching: PropTypes.func,
    onOpen: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    dropdownPlacement: PropTypes.string,
    openDropdownId: PropTypes.number,
    openedViaKeyboard: PropTypes.bool,
    custom_emojis: ImmutablePropTypes.list,
    onPickEmoji: PropTypes.func.isRequired,
    onRemoveEmoji: PropTypes.func.isRequired,
    onSkinTone: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    skinTone: PropTypes.number.isRequired,
    frequentlyUsedEmojis: PropTypes.arrayOf(PropTypes.string),
  };

  static defaultProps = {
    active: false,
    pressed: false,
    iconButtonClass: 'status__action-bar-button',
  };

  state = {
    id: id++,
  };

  handleClick = ({ target, type }) => {
    if (this.props.pressed) {
      this.props.onRemoveEmoji();
    } else if (this.state.id === this.props.openDropdownId) {
        this.handleClose();
    } else {
      const { top } = target.getBoundingClientRect();
      const placement = top * 2 < innerHeight ? 'bottom' : 'top';
      this.props.onOpen(this.state.id, placement, type !== 'click');
    }
  }

  handleClose = () => {
    if (this.activeElement) {
      this.activeElement.focus({ preventScroll: true });
      this.activeElement = null;
    }
    this.props.onClose(this.state.id);
  }

  handleMouseDown = () => {
    if (!this.state.open) {
      this.activeElement = document.activeElement;
    }
  }

  handleButtonKeyDown = (e) => {
    switch(e.key) {
    case ' ':
    case 'Enter':
      this.handleMouseDown();
      break;
    }
  }

  handleKeyPress = (e) => {
    switch(e.key) {
    case ' ':
    case 'Enter':
      this.handleClick(e);
      e.stopPropagation();
      e.preventDefault();
      break;
    }
  }

  setTargetRef = c => {
    this.target = c;
  }

  findTarget = () => {
    return this.target;
  }

  componentWillUnmount = () => {
    if (this.state.id === this.props.openDropdownId) {
      this.handleClose();
    }
  }

  render () {
    const { icon, size, title, disabled, dropdownPlacement, openDropdownId, openedViaKeyboard, active, pressed, iconButtonClass } = this.props;
    const { custom_emojis, onPickEmoji, onSkinTone, skinTone, frequentlyUsedEmojis } = this.props;
    const open = this.state.id === openDropdownId;

    return (
      <div className='emoji-picker-dropdown'>
        <IconButton
          icon={icon}
          title={title}
          active={active}
          pressed={pressed}
          className={iconButtonClass}
          disabled={disabled}
          size={size}
          ref={this.setTargetRef}
          onClick={this.handleClick}
          onMouseDown={this.handleMouseDown}
          onKeyDown={this.handleButtonKeyDown}
          onKeyPress={this.handleKeyPress}
        />

        <Overlay show={open} placement={dropdownPlacement} target={this.findTarget}>
          <ReactionPickerDropdownMenu
            onClose={this.handleClose}
            openedViaKeyboard={openedViaKeyboard}
            custom_emojis={custom_emojis}
            onPickEmoji={onPickEmoji}
            onSkinTone={onSkinTone}
            skinTone={skinTone}
            frequentlyUsedEmojis={frequentlyUsedEmojis}
          />
        </Overlay>
      </div>
    );
  }

}
