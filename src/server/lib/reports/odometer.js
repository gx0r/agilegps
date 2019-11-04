/* Copyright (c) 2016 Grant Miner */
"use strict";
const isFinite = require("lodash").isFinite;
const get = require("lodash").get;
const bunyan = require("bunyan");
const Promise = require("bluebird");
const moment = require("moment");
const cleanData = require("../../../common/helpers").cleanData;
const mileageChange = require("../../../common/helpers").mileageChange;
const ignitionMileage = require("../../../common/helpers").ignitionMileage;
const getStatus = require("../../../common/status").getStatus;
const isIdle = require("../../../common/status").isIdle;
const isPark = require("../../../common/status").isPark;
const isStop = require("../../../common/status").isStop;
const isStart = require("../../../common/status").isStart;
const isTow = require("../../../common/status").isTow;
const displayState = require("../../../common/addressdisplay").state;

const log = bunyan.createLogger({
  name: "reports"
  // level: 'debug'
});

module.exports = history => {
  history = history.filter(function(item) {
    return item.la != null && item.lo != null;
  });

  history = cleanData(history);
  history = mileageChange(history);
  history = ignitionMileage(history);

  let odometerStart, odometerEnd;
  let mileageByState = [];
  let currentState = null;
  let firstState = true;

  history.reduce(function(prev, curr, idx, array) {
    if (isFinite(curr.m) && curr.m > 0) {
      let state = displayState(curr) || "Unknown";

      if (state != null && firstState) {
        currentState = state;
        odometerStart = curr.m;
        odometerEnd = curr.m;
        firstState = false;
      } else if (
        (state != null && state != currentState) ||
        idx === array.length - 1
      ) {
        // hit a new state or the end
        odometerEnd = curr.m;
        mileageByState.push({
          state: currentState,
          odometerStart: odometerStart,
          odometerEnd: odometerEnd
        });

        currentState = state;
        odometerStart = curr.m;
        odometerEnd = curr.m;
      } else {
        if (state != null) {
          odometerEnd = curr.m;
        }
      }
    }
  }, []);

  return mileageByState;
};
