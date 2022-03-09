import { openDropdownMenu, closeDropdownMenu } from '../actions/dropdown_menu';
import { fetchRelationships } from 'mastodon/actions/accounts';
import { openModal, closeModal } from '../actions/modal';
import { connect } from 'react-redux';
import ReactionPickerDropdown from '../components/reaction_picker_dropdown';
import { isUserTouching } from '../is_mobile';

import { changeSetting } from '../actions/settings';
import { createSelector } from 'reselect';
import { Map as ImmutableMap } from 'immutable';
import { useEmoji } from '../actions/emojis';

const perLine = 8;
const lines   = 2;

const DEFAULTS = [
  '+1',
  'grinning',
  'kissing_heart',
  'heart_eyes',
  'laughing',
  'stuck_out_tongue_winking_eye',
  'sweat_smile',
  'joy',
  'yum',
  'disappointed',
  'thinking_face',
  'weary',
  'sob',
  'sunglasses',
  'heart',
  'ok_hand',
];

const getFrequentlyUsedEmojis = createSelector([
  state => state.getIn(['settings', 'frequentlyUsedEmojis'], ImmutableMap()),
], emojiCounters => {
  let emojis = emojiCounters
    .keySeq()
    .sort((a, b) => emojiCounters.get(a) - emojiCounters.get(b))
    .reverse()
    .slice(0, perLine * lines)
    .toArray();

  if (emojis.length < DEFAULTS.length) {
    let uniqueDefaults = DEFAULTS.filter(emoji => !emojis.includes(emoji));
    emojis = emojis.concat(uniqueDefaults.slice(0, DEFAULTS.length - emojis.length));
  }

  return emojis;
});

const getCustomEmojis = createSelector([
  state => state.get('custom_emojis'),
], emojis => emojis.filter(e => e.get('visible_in_picker')).sort((a, b) => {
  const aShort = a.get('shortcode').toLowerCase();
  const bShort = b.get('shortcode').toLowerCase();

  if (aShort < bShort) {
    return -1;
  } else if (aShort > bShort ) {
    return 1;
  } else {
    return 0;
  }
}));

const getState = (dispatch) => new Promise((resolve) => {
  dispatch((dispatch, getState) => {resolve(getState())})
})

const mapStateToProps = state => ({
  custom_emojis: getCustomEmojis(state),
  skinTone: state.getIn(['settings', 'skinTone']),
  frequentlyUsedEmojis: getFrequentlyUsedEmojis(state),
  dropdownPlacement: state.getIn(['dropdown_menu', 'placement']),
  openDropdownId: state.getIn(['dropdown_menu', 'openId']),
  openedViaKeyboard: state.getIn(['dropdown_menu', 'keyboard']),
});

const mapDispatchToProps = (dispatch, { status, onPickEmoji, scrollKey }) => ({
  onSkinTone: skinTone => {
    dispatch(changeSetting(['skinTone'], skinTone));
  },

  onPickEmoji: emoji => {
    dispatch(useEmoji(emoji));

    if (onPickEmoji) {
      onPickEmoji(emoji);
    }
  },
  
  onOpen(id, dropdownPlacement, keyboard) {
    dispatch((_, getState) => {
      let state = getState();
      if (status) {
        dispatch(fetchRelationships([status.getIn(['account', 'id'])]));
      }

      dispatch(isUserTouching() ? openModal('REACTION', {
        status: status,
        onPickEmoji: onPickEmoji,
        onSkinTone: skinTone => {
          dispatch(changeSetting(['skinTone'], skinTone));
        },
        custom_emojis: getCustomEmojis(state),
        skinTone: state.getIn(['settings', 'skinTone']),
        frequentlyUsedEmojis: getFrequentlyUsedEmojis(state),
      }) : openDropdownMenu(id, dropdownPlacement, keyboard, scrollKey));
    });
  },

  onClose(id) {
    dispatch(closeModal('REACTION'));
    dispatch(closeDropdownMenu(id));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ReactionPickerDropdown);
