import { createSelector } from 'reselect';
import { take, union } from 'lodash';

const events = (state) => state.events

export const getEventKeys = createSelector(
  [events],
  (events) => {
    if (events.length > 0) {
      // const events = take(events, 10);
      let keys = [];
      events.forEach(event => {
        keys = union(keys, Object.keys(event));
      });

      // Add buttons
      // keys.unshift("Geocode");
      return keys;
    } else {
      return [];
    }
  }
)
