import {
  REBLOG_REQUEST,
  REBLOG_FAIL,
  FAVOURITE_REQUEST,
  FAVOURITE_FAIL,
  UNFAVOURITE_SUCCESS,
  BOOKMARK_REQUEST,
  BOOKMARK_FAIL,
  EMOJI_REACTION_REQUEST,
  EMOJI_REACTION_FAIL,
  UN_EMOJI_REACTION_REQUEST,
  UN_EMOJI_REACTION_FAIL,
  EMOJI_REACTION_UPDATE,
} from '../actions/interactions';
import {
  STATUS_MUTE_SUCCESS,
  STATUS_UNMUTE_SUCCESS,
  STATUS_REVEAL,
  STATUS_HIDE,
  STATUS_COLLAPSE,
  QUOTE_REVEAL,
  QUOTE_HIDE,
} from '../actions/statuses';
import { TIMELINE_DELETE } from '../actions/timelines';
import { STATUS_IMPORT, STATUSES_IMPORT } from '../actions/importer';
import { Map as ImmutableMap, fromJS } from 'immutable';

const importStatus = (state, status) => {
  if (state.getIn([status.in_reply_to_id, 'replies_count'], null) == 0) {
    state = state.setIn([status.in_reply_to_id, 'replies_count'], 1);
  }
  return state.set(status.id, fromJS(status));
};

const importStatuses = (state, statuses) =>
  state.withMutations(mutable => statuses.forEach(status => importStatus(mutable, status)));

const deleteStatus = (state, id, references, quotes) => {
  references.forEach(ref => {
    state = deleteStatus(state, ref, []);
  });

  quotes.forEach(ref => {
    state = state.setIn([ref, 'quote_id'], null).setIn([ref, 'quote'], null)
  });

  return state.delete(id);
};

const updateEmojiReaction = (state, id, name, domain, url, static_url, updater) => state.update(id, status => {
  return status.update('emoji_reactions', emojiReactions => {
    const idx = emojiReactions.findIndex(emojiReaction => !domain && !emojiReaction.get('domain') && emojiReaction.get('name') === name || emojiReaction.get('name') === name && emojiReaction.get('domain', null) === domain);

    if (idx > -1) {
      return emojiReactions.update(idx, emojiReactions => updater(emojiReactions));
    }

    return emojiReactions.push(updater(fromJS({ name, domain, url, static_url, count: 0 })));
  });
});

const updateEmojiReactionCount = (state, emojiReaction) => updateEmojiReaction(state, emojiReaction.status_id, emojiReaction.name, emojiReaction.domain, emojiReaction.url, emojiReaction.static_url, x => x.set('count', emojiReaction.count));

const addEmojiReaction = (state, id, name, domain, url, static_url) => updateEmojiReaction(state, id, name, domain, url, static_url, x => x.set('me', true).update('count', y => y + 1));

const removeEmojiReaction = (state, id, name, domain, url, static_url) => updateEmojiReaction(state, id, name, domain, url, static_url, x => x.set('me', false).update('count', y => y - 1));

const initialState = ImmutableMap();

export default function statuses(state = initialState, action) {
  switch(action.type) {
  case STATUS_IMPORT:
    return importStatus(state, action.status);
  case STATUSES_IMPORT:
    return importStatuses(state, action.statuses);
  case FAVOURITE_REQUEST:
    return state.setIn([action.status.get('id'), 'favourited'], true);
  case UNFAVOURITE_SUCCESS:
    return state.updateIn([action.status.get('id'), 'favourites_count'], x => Math.max(0, x - 1));
  case FAVOURITE_FAIL:
    return state.get(action.status.get('id')) === undefined ? state : state.setIn([action.status.get('id'), 'favourited'], false);
  case BOOKMARK_REQUEST:
    return state.get(action.status.get('id')) === undefined ? state : state.setIn([action.status.get('id'), 'bookmarked'], true);
  case BOOKMARK_FAIL:
    return state.get(action.status.get('id')) === undefined ? state : state.setIn([action.status.get('id'), 'bookmarked'], false);
  case EMOJI_REACTION_UPDATE:
    return state.get(action.emojiReaction.status_id) === undefined ? state : updateEmojiReactionCount(state, action.emojiReaction);
  case EMOJI_REACTION_REQUEST:
  case UN_EMOJI_REACTION_FAIL:
    if (state.get(action.status.get('id')) !== undefined) {
      state = state.setIn([action.status.get('id'), 'emoji_reactioned'], true);
      state = addEmojiReaction(state, action.status.get('id'), action.name, action.domain, action.url, action.static_url);
    }
    return state;
  case UN_EMOJI_REACTION_REQUEST:
  case EMOJI_REACTION_FAIL:
    if (state.get(action.status.get('id')) !== undefined) {
      state = state.setIn([action.status.get('id'), 'emoji_reactioned'], false);
      state = removeEmojiReaction(state, action.status.get('id'), action.name, action.domain, action.url, action.static_url);
    }
    return state;
  case REBLOG_REQUEST:
    return state.setIn([action.status.get('id'), 'reblogged'], true);
  case REBLOG_FAIL:
    return state.get(action.status.get('id')) === undefined ? state : state.setIn([action.status.get('id'), 'reblogged'], false);
  case STATUS_MUTE_SUCCESS:
    return state.setIn([action.id, 'muted'], true);
  case STATUS_UNMUTE_SUCCESS:
    return state.setIn([action.id, 'muted'], false);
  case STATUS_REVEAL:
    return state.withMutations(map => {
      action.ids.forEach(id => {
        if (!(state.get(id) === undefined)) {
          map.setIn([id, 'hidden'], false);
        }
      });
    });
  case STATUS_HIDE:
    return state.withMutations(map => {
      action.ids.forEach(id => {
        if (!(state.get(id) === undefined)) {
          map.setIn([id, 'hidden'], true);
        }
      });
    });
  case STATUS_COLLAPSE:
    return state.setIn([action.id, 'collapsed'], action.isCollapsed);
  case QUOTE_REVEAL:
    return state.withMutations(map => {
      action.ids.forEach(id => map.setIn([id, 'quote_hidden'], false));
    });
  case QUOTE_HIDE:
    return state.withMutations(map => {
      action.ids.forEach(id => map.setIn([id, 'quote_hidden'], true));
    });
  case TIMELINE_DELETE:
    return deleteStatus(state, action.id, action.references, action.quotes);
  default:
    return state;
  }
};
