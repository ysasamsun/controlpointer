var assert = require('chai').assert;
var GameStats = require('../src_shared/GameStats.js');
var fixtures = require('../fixtures');
var Promise = require('bluebird');
var R = require('ramda');


describe('GameStats', function() {
  var gs;

  beforeEach(function() {
    gs = new GameStats(fixtures.timeline, fixtures.gameSettings);
    gsSimple = new GameStats(fixtures.simpleTimeline, fixtures.simpleGameSettings);
  });

  describe('Constructor', function() {
    it('should return an instance of GameStats', function() {
      const gs2 = new GameStats(fixtures.timeline, fixtures.simpleGameSettings);
      assert.instanceOf(gs2, GameStats);
    });

    it('should accept a timeline object and a game object', function() {
      const gs2 = new GameStats(fixtures.timeline, fixtures.gameSettings);
      assert.instanceOf(gs2, GameStats);
    });

    it('should throw when not receiving a gameSettings parameter', function() {
      assert.throws(() => {
        new GameStats(fixtures.timeline);
      });
    });

    it('should throw when not receiving a timeline object as first param', function() {
      assert.throws(() => {
        new GameStats();
      })
    });
  });

  describe('gameLength()', function() {
    it('should return a ms duration 7200000', function() {
      const gl = gs.gameLength();
      assert.equal(gl, 7200000);
    });
    it('should return a ms duration 300000 (simpleGameSettings)', function() {
      const gs2 = new GameStats(fixtures.timeline, fixtures.simpleGameSettings);
      const gl = gs2.gameLength();
      assert.equal(gl, 300000);
    });
  });

  describe('timePointer()', function() {
    it('should return a ms timestamp', function() {
      const timePointer = gs.timePointer;
      assert.isNumber(timePointer);
    });
    it('should be settable', function() {
      gs.timePointer = 5;
      assert.equal(gs.timePointer, 5);
    })
  });

  describe('timelineAfterDate()', function() {
    it('should accept a number', function() {
      const testDate = 1542570007606;
      const tl = gs.timelineAfterDate(testDate);
      assert.isArray(tl);
      const validate = (tli) => {
        const createdAt = parseInt(R.prop('createdAt', tli));
        assert.isNumber(createdAt)
        assert.isAbove(createdAt, testDate);
      }
      R.forEach(validate, tl);
    });

    it('should accept a string', function() {
      const testDate = '1542570007606';
      const tl = gs.timelineAfterDate(testDate);
      assert.isArray(tl);
      const validate = (tli) => {
        const createdAt = parseInt(R.prop('createdAt', tli));
        assert.isNumber(createdAt)
        assert.isAbove(createdAt, parseInt(testDate));
      }
      R.forEach(validate, tl);
    });

    it('should return an array containing only events after the inputted date', function() {
      const testDate = 1542570007606;
      const tl = gs.timelineAfterDate(testDate);
      assert.isArray(tl);
      const validate = (tli) => {
        const createdAt = parseInt(R.prop('createdAt', tli));
        assert.isNumber(createdAt)
        assert.isAbove(createdAt, testDate);
      }
      R.forEach(validate, tl);
    });
  });

  describe('gameStatus()', function() {
    it('should return an object with status data', function() {
      const status = gs.gameStatus();
      assert.isObject(status);
      assert.property(status, 'msg');
      assert.property(status, 'code');
      assert.isString(status.msg);
      assert.isNumber(status.code);
    });

    it('should return a message with either \'running\', \'paused\', \'over\', or \'stopped\'.', function() {
      const status = gs.gameStatus();
      assert.match(status.msg, /running|paused|stopped|over/);
    });

    it('should return an integer status code with either 0, 1, 2, or 3.', function() {
      const status = gs.gameStatus();
      assert.oneOf(status.code, [
        0,
        1,
        2,
        3
      ]);
    });

    it('should indicate that the game is running when the most recent lifecycle event is a start action', function() {
      const gs2 = new GameStats(fixtures.runningTimeline, fixtures.simpleGameSettings);
      gs2.timePointer = 4701341506760;
      const status = gs2.gameStatus();
      assert.deepEqual(status, { code: 0, msg: 'running' });
    });

    it('should indicate that the game is stopped when the active timeline is empty', function() {
      const gs2 = new GameStats(fixtures.stoppedTimeline, fixtures.simpleGameSettings);
      const status = gs2.gameStatus();
      assert.deepEqual(status, { code: 2, msg: 'stopped' });
    });

    it('should indicate that the game is paused when the most recent lifecycle event is a pause action', function() {
      const gs2 = new GameStats(fixtures.pausedTimeline, fixtures.simpleGameSettings);
      const status = gs2.gameStatus();
      assert.deepEqual(status, { code: 1, msg: 'paused' });
    });

    it('should indicate that the game is over when the endTime is in the past', function() {
      const gs2 = new GameStats(fixtures.finishedTimeline, fixtures.simpleGameSettings);
      gs2.timePointer = 7857016999962;
      const status = gs2.gameStatus();
      assert.deepEqual(status, { code: 3, msg: 'over' });
    });
  });

  describe('buildTimePointer()', function() {
    it('should return a point in time (ms since epoch)', function() {
      var pointer = gs.buildTimePointer();
      assert.isNumber(pointer);
    });
  });

  describe('mostRecentStop()', function() {
    it('should return the ms since epoch of the most recent stop', function() {
      const mostRecent = gs.mostRecentStop();
      assert.isNumber(mostRecent);
      assert.equal(mostRecent, 1542652594189);
    });
  });


  describe('gameStartTime()', function() {
    it('should return a number', function() {
      const gameStartTime = gs.gameStartTime();
      assert.isNumber(gameStartTime);
    });

    it('should return the timestamp of the first start action in the active timeline', function() {
      const tl = gs.activeTimeline();
      const firstStartEvent = R.find(R.propEq('action', 'start'), tl);
      const gameStartTime = gs.gameStartTime();
      assert.isDefined(gameStartTime);
      assert.equal(
        gameStartTime,
        R.prop('createdAt', firstStartEvent)
      );
    });

    it('should return 5000 (simpleTimeline)', function() {
      const gst = gsSimple.gameStartTime();
      assert.equal(gst, 5000);
    });
  });

  describe('gamePausedDuration()', function() {

    it('should return the total number of ms that the game has been paused for', function() {
      const tl = gs.activeTimeline();
      const lastEventTimestamp = R.prop('createdAt', R.last(tl));
      gs.timePointer = lastEventTimestamp;
      const pausedDuration = gs.gamePausedDuration();
      assert.equal(
        pausedDuration,
        623534264
      );
    });

    it('should correctly calculate total paused time between game start and gs.timePointer', function() {
      gsSimple.timePointer = 40000;
      const gpd = gsSimple.gamePausedDuration();
      assert.equal(gpd, 25000)
    });

    it('should return 100000 (runningTimeline)', function() {
      const gs2 = new GameStats(fixtures.runningTimeline, fixtures.simpleGameSettings);
      gs2.timePointer = 4701341506760;
      const gpd = gs2.gamePausedDuration();
      assert.equal(gpd, 100000);
    });

    it('should return the same pausedDuration even when the timePointer is set past the end time (runningTimeline)', function() {
      const gs2 = new GameStats(fixtures.runningTimeline, fixtures.simpleGameSettings);
      gs2.timePointer = 5701341506760;
      const gpd = gs2.gamePausedDuration();
      assert.equal(gpd, 100000);
    });

    it('should return 10000 (pausedTimeline)', function() {
      gsSimple.timePointer = 20000;
      const gpd = gsSimple.gamePausedDuration();
      assert.equal(gpd, 5000);
    });

  });

  describe('gameElapsedDuration()', function() {
    it('should return the total number of ms that the game has been running AND paused for', function() {
      const gameElapsedDuration = gs.gameElapsedDuration();
      assert.isNumber(gameElapsedDuration);
    });

    it('should return a different value based on where GameStats#timePointer is at', function() {
      gs.timePointer = 1544244638041;
      const gameElapsedDuration = gs.gameElapsedDuration();
      assert.equal(gameElapsedDuration, 374793);
    });
  });

  describe('gameRunningDuration()', function() {
    it('should return the total number of ms that the game has been RUNNING for (not paused)', function() {
      const gameRunningDuration = gsSimple.gameRunningDuration();
      gsSimple.timePointer = 20000;
      assert.equal(gsSimple.gameRunningDuration(), 10000);
    });
  });

  describe('gameEndTime()', function() {
    it('should return the computed end time based on start time, accrued paused time, and specified game duration', function() {
      const gameEndTime = gs.gameEndTime();
      assert.isNumber(gameEndTime);
    });

    it('should return 4701341406760 (runningTimeline)', function() {
      const gs2 = new GameStats(fixtures.runningTimeline, fixtures.simpleGameSettings);
      gs2.timePointer = 4701341506760;
      const get = gs2.gameEndTime();
      assert.equal(get, 4701341706760);
    });

    it('should return 290000 (simpleTimeline)', function() {
      gsSimple.timePointer = 20000;
      const get = gsSimple.gameEndTime();
      assert.equal(get, 290000);
    });

    it('should return 1545467472303 when the game ended in the past (finishedTimeline)', function() {
      const gs2 = new GameStats(fixtures.finishedTimeline, fixtures.simpleGameSettings);
      gs2.timePointer = 1545859447678;
      const get = gs2.gameEndTime();
      assert.equal(get, 1545467472303);
    });

  });

  describe('lifecycleTimeline()', function() {
    it('should return an array of start/pause timeline events', function() {
      const lctl = gs.lifecycleTimeline();
      assert.isArray(lctl);
      const validate = (tli) => {
        assert.property(tli, 'type');
        assert.property(tli, 'action');
        assert.match(tli.action, /start|pause/);
        assert.property(tli, 'source');
        assert.property(tli, 'target');
        assert.property(tli, 'createdAt');
        assert.property(tli, '_id');
      }
      R.forEach(validate, lctl);
    });
    it('should be an array of 3 events (runningTimeline)', function() {
      const gs2 = new GameStats(fixtures.runningTimeline, fixtures.simpleGameSettings);
      gs2.timePointer = 4701341506760;
      const lctl = gs2.lifecycleTimeline();
      assert.lengthOf(lctl, 3);
    });
  });

  describe('activeTimeline()', function() {
    it('should return an array of timeline events', function() {
      const tl = gs.activeTimeline();

      assert.isArray(tl);
      const validate = (tli) => {
        assert.property(tli, 'type');
        assert.property(tli, 'action');
        assert.property(tli, 'source');
        assert.property(tli, 'target');
        assert.property(tli, 'createdAt');
        assert.property(tli, '_id');
      };
      R.forEach(validate, tl);
    })

    it('should contain 24 elements when timePointer is set to default (now)', function() {
        const tl = gs.activeTimeline();
        assert.lengthOf(tl, 24);
    })

    it('should never contain a stop action', function() {
      const tl = gs.activeTimeline();
      const validate = (tli) => {
        assert.notPropertyVal(tli, 'action', 'stop');
      }
      R.forEach(validate, tl);
    });

    it('should contain 6 elements when timePointer is set to 1544244988308', function() {
      gs.timePointer = 1544244988308;
      const tl = gs.activeTimeline();
      assert.lengthOf(tl, 6);
    });

    it('should contain 3 elements (runningTimeline)', function() {
      const gs2 = new GameStats(fixtures.runningTimeline, fixtures.simpleGameSettings);
      gs2.timePointer = 4701341506760;
      const tl = gs2.activeTimeline();
      assert.lengthOf(tl, 3);
    });

  });

  describe('cleansedTimeline()', function() {
    it('should return an array of timeline events without duplicate neighboring actions', function() {
      const tl = gs.cleansedTimeline();

      // R.forEach((i) => {
      //   console.log(R.prop('action', i));
      // }, tl);

      assert.isArray(tl);
      const validate = (tli, idx, allTl) => {
        const createdAt = parseInt(R.prop('createdAt', tli));
        assert.property(tli, 'type');
        assert.property(tli, 'action');
        assert.property(tli, 'source');
        assert.property(tli, 'target');
        assert.property(tli, 'createdAt');
        assert.property(tli, '_id');


        R.unless(
          R.equals(allTl.length, idx),
          assert.notEqual(
            R.prop('action', tli),
            R.prop('action', allTl[idx+1]),
            'A duplicate timeline action was found in cleansedTimeline\'s output!'
          )
        )
      };

      const forEachIdx = R.addIndex(R.forEach);
      forEachIdx(validate, tl);
    });

    it('should have 30 elements', function() {
      const tl = gs.cleansedTimeline();
      assert.lengthOf(tl, 30);
    });

    it('should have chronologically sorted events', function() {
      const tl = gs.cleansedTimeline();
      var lastTimestamp = 0;
      const validate = (tli) => {
        const thisTimestamp = R.prop('createdAt', tli);
        assert.isAbove(thisTimestamp, lastTimestamp);
        lastTimestamp = R.prop('createdAt', tli);
      }
      R.forEach(validate, tl);
    });
  });


});
