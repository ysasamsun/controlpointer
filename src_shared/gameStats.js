const R = require('ramda');
const moment = require('moment');

/*
 * GameStats
 * Handles calculation of game timers.
 */

const timePointer = (findTimelineInStore, findGameInStore, timePointer) => {
  const {
    tl,
    game,
    tp
  } = buildParameters(findTimelineInStore, findGameInStore, timePointer);
  return tp;
}




const buildParameters = (findTimelineInStore, findGameInStore, timePointer) => {
  if (typeof findTimelineInStore === 'undefined') throw new Error('first parameter to buildParameters must be defined!')
  if (typeof findGameInStore === 'undefined') throw new Error('second parameter to buildParameters must be defined!')
  if (
    typeof findTimelineInStore === 'string' ||
    typeof findGameInStore === 'string' ||
    typeof timePointer === 'string'
  ) throw new Error('buildParameters received a string as an argument which is not allowed')
  if (typeof timePointer === 'undefined') timePointer = moment().valueOf();


  var tl;
  if (typeof findTimelineInStore === 'function') {
    tl = findTimelineInStore({
      query: {
        $sort: {
          createdAt: 1
        }
      }
    }).data;
  } else {
    tl = findTimelineInStore;
  }

  var game;
  if (typeof findGameInStore === 'function') {
    game = findGameInStore({
      query: {
        $sort: {
          createdAt: 1
        },
        $limit: 1
      }
    }).data[0] || [];
  } else {
    game = findGameInStore;
  }

  const tp = timePointer;

  return {
    tl,
    game,
    tp
  };
};

const gameLength = (findTimelineInStore, findGameInStore, timePointer) => {
  const {
    game
  } = buildParameters(findTimelineInStore, findGameInStore, timePointer);
  const gl = game.gameLength;
  if (typeof game.gameLength === 'undefined') throw new Error('gameLength was not defined in game settings object!')
  return gl;
}

const gameStartTime = (findTimelineInStore, findGameInStore, timePointer) => {
  const tl = activeTimeline(findTimelineInStore, findGameInStore, timePointer);
  const startEvent = R.find(
    R.propEq('action', 'start'),
    tl
  )
  const startTime = R.prop('createdAt', startEvent);
  return startTime;
}

/**
 * gameEndTime()
 * Returns the computed end time based on start time,
 * accrued paused time, and specified game duration.
 * @returns {Number} gameEndTime - the ms timestamp when the game will be
 *                                 considered ended.
 */
const gameEndTime = (findTimelineInStore, findGameInStore, timePointer) => {
  const { tl, game, tp } = buildParameters(findTimelineInStore, findGameInStore, timePointer);
  if (activeTimeline(tl, game, tp).length < 1) return moment(0).valueOf();
  const gst = moment(gameStartTime(tl, game, tp));
  const gpd = moment.duration(gamePausedDuration(tl, game, tp));
  const gl = moment.duration(gameLength(tl, game, tp));
  const ged = moment.duration(gameElapsedDuration(tl, game, tp));
  const get = gst.clone().add(gl).add(gpd).valueOf();
  return get;
}


const gameStatus = (findTimelineInStore, findGameInStore, timePointer) => {
  const { tl, game, tp } = buildParameters(findTimelineInStore, findGameInStore, timePointer);
  const lctl = lifecycleTimeline(tl, game, tp);
  const mostRecentLifecycleEvent = R.last(lctl);
  const get = moment(gameEndTime(tl, game, tp));
  const gl = moment.duration(gameLength(tl, game, tp));
  const now = moment(tp);

  if (lctl.length == 0) return {
    code: 2,
    msg: 'stopped'
  };
  if (now.isAfter(get)) return {
    code: 3,
    msg: 'over'
  };
  if (mostRecentLifecycleEvent.action === 'start') return {
    code: 0,
    msg: 'running'
  };
  if (mostRecentLifecycleEvent.action === 'pause') return {
    code: 1,
    msg: 'paused'
  };
}

const activeTimeline = (findTimelineInStore, findGameInStore, timePointer) => {
  // activeTimeline is an array of cleansed timeline events
  // following the latest stop event up until the timePointer
  // if there is no stop event, it is the entire cleansed timeline.
  const { tl, game, tp } = buildParameters(findTimelineInStore, findGameInStore, timePointer);

  const ct = cleansedTimeline(tl, game, tp);
  if (ct.length < 1) return [];

  const lastStopEventIndex = R.findLastIndex(
    R.propEq('action', 'stop')
  )(ct);


  const allEventsAfterLastStopEvent = R.slice(
    R.add(lastStopEventIndex, 1),
    R.length(ct),
    ct
  );

  const allEventsOrSome = R.ifElse(
    R.equals(-1),
    R.always(ct),
    R.always(allEventsAfterLastStopEvent)
  );

  const relevantTimeline = allEventsOrSome(lastStopEventIndex);

  const pointer = timePointer;

  const isEventBeforePointer = (evt) => {
    return R.lte(
      R.prop('createdAt', evt),
      pointer
    );
  }

  const at = R.filter(isEventBeforePointer, relevantTimeline);

  return at;
}



// cleansedTimeline is the timeline without duplicate events
const cleansedTimeline = (findTimelineInStore, findGameInStore, timePointer) => {
  const {
    tl,
    game,
    tp
  } = buildParameters(findTimelineInStore, findGameInStore, timePointer);

  const sortByTimestamp = R.sortBy(R.prop('createdAt'));
  const sortedTimeline = sortByTimestamp(tl);

  return deDup(sortedTimeline);
};


const deDup = (arr) => {
  const filterIndexed = R.addIndex(R.filter);
  const isItemValid = (evt, idx, col) => {
    if (idx == col.length - 1) return true;
    if (
      R.equals(
        R.prop('action', evt),
        R.prop('action', col[idx + 1])
      )
    ) {
      return false
    } else {
      return true;
    }
  };
  const backwardsArr = R.reverse(arr);
  const backwardsDedupedArr = filterIndexed(
    isItemValid,
    backwardsArr
  );
  const deDupedArr = R.reverse(backwardsDedupedArr)
  return deDupedArr;
};

const lifecycleTimeline = (findTimelineInStore, findGameInStore, timePointer) => {
  const tl = activeTimeline(findTimelineInStore, findGameInStore, timePointer);
  const isLifeCycleEvent = (evt) => (evt.action === 'start' || evt.action === 'pause') ? true : false;
  const lifecycleTimeline = R.filter(isLifeCycleEvent, tl);
  return lifecycleTimeline;
}


// /**
//  * timelineAfterDate
//  * @param {String} date - date in milliseconds
//  * @returns {Promise}
//  */
// const timelineAfterDate = (date) {
//   date = parseInt(date);
//   const afterDate = item => R.gt(R.prop('createdAt', item), date);
//   return R.sortBy(
//     R.prop('createdAt'), this.timeline
//   ).filter(
//     afterDate
//   );
// }

const gt = (findTimelineInStore, findGameInStore, timePointer) => {
  const {
    tl,
    game
  } = buildParameters(findTimelineInStore, findGameInStore, timePointer);
  const rando = Math.floor(Math.random() * 100) + 1;
  const isEven = (n) => (n % 2 == 0);
  const datum1 = isEven(rando) ? 'scenario 1' : 'WE GOT A #2, SOYBOIz!'
  const datum2 = R.prop('action', R.last(tl)) || 'idk';
  const datum3 = R.prop('gameLength', R.last(game)) || 'fukifiknow';
  const datum4 = isEven(rando);
  return {
    'a': datum1,
    'b': datum2,
    'c': datum3,
    'd': datum4
  };
}

const gamePausedDuration = (findTimelineInStore, findGameInStore, timePointer) => {
  const {
    tl,
    game,
    tp
  } = buildParameters(findTimelineInStore, findGameInStore, timePointer);
  const indexedMap = R.addIndex(R.map);
  const lctl = lifecycleTimeline(tl, game, tp);

  const algo = (evt, idx, col) => {

    if (idx % 2 === 0) return 0; // only process odd events (pauses)

    const thisTimestamp = moment(evt.createdAt);
    const resumeTimestamp = ((idx, col) => {
      if ((idx + 1) === col.length) {
        return moment(tp);
      } else return moment(col[idx + 1].createdAt);
    })(idx, col);

    const msDelta = moment.duration(
      resumeTimestamp.diff(thisTimestamp)
    );

    return msDelta.valueOf();
  }

  const pausedDurations = indexedMap(algo, lctl);
  const duration = R.reduce(R.add, 0, pausedDurations);
  return duration;
}


/**
 * gameElapsedDuration
 * @returns {Number} gameElapsedDuration - total number of ms in which
 *                                         the game has been running AND paused
 */
const gameElapsedDuration = (findTimelineInStore, findGameInStore, timePointer) => {
  const gst = moment(gameStartTime(findTimelineInStore, findGameInStore, timePointer));
  const now = moment(timePointer);
  return moment.duration(now.clone().diff(gst)).valueOf();
}

/**
 * @returns {Number} gameRunningDuration - the total number of ms that the game has been RUNNING for (not paused)
 */
const gameRunningDuration = (findTimelineInStore, findGameInStore, timePointer) => {
  const {
    tl,
    game,
    tp
  } = buildParameters(findTimelineInStore, findGameInStore, timePointer);
  const gst = moment(gameStartTime(tl, game, tp));
  const gpd = moment.duration(gamePausedDuration(tl, game, tp));
  const now = moment(tp);
  // ((now - startTime) - pausedDuration)
  const grd = moment.duration(now.diff(gst)).subtract(gpd).valueOf();
  return grd;
}



const mostRecentStop = (findTimelineInStore, findGameInStore, timePointer) => {
  const {
    tl,
    game,
    tp
  } = buildParameters(findTimelineInStore, findGameInStore, timePointer);
  const sort = R.sortBy(
    R.prop('createdAt'), tl
  );
  const last = R.findLast(
    R.propEq('action', 'stop'), sort
  );
  return R.prop('createdAt', last);
}



module.exports = {
  install(Vue, opts) {
    Vue.prototype.$gameStats = {};
    Vue.prototype.$gameStats.gt = gt;
    Vue.prototype.$gameStats.cleansedTimeline = cleansedTimeline;
    Vue.prototype.$gameStats.lifecycleTimeline = lifecycleTimeline;
    Vue.prototype.$gameStats.gamePausedDuration = gamePausedDuration;
    Vue.prototype.$gameStats.activeTimeline = activeTimeline;
    Vue.prototype.$gameStats.gameStartTime = gameStartTime;
    Vue.prototype.$gameStats.gameEndTime = gameEndTime;
    Vue.prototype.$gameStats.gameStatus = gameStatus;
    Vue.prototype.$gameStats.gameElapsedDuration = gameElapsedDuration;
    Vue.prototype.$gameStats.gameRunningDuration = gameRunningDuration;
    Vue.prototype.$gameStats.gameLength = gameLength;
    Vue.prototype.$gameStats.timePointer = timePointer;
    Vue.prototype.$gameStats.mostRecentStop = mostRecentStop;
  }
}