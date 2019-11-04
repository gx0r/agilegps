/* Copyright (c) 2016 Grant Miner */
"use strict";
const _ = require("lodash");
const get = require("lodash").get;
const bunyan = require("bunyan");
const Promise = require("bluebird");
const moment = require("moment");
const cleanData = require("../../../common/helpers").cleanData;
const getAccuracy = require("../../../common/helpers").getAccuracy;
const nullToBlank = require("../../../common/helpers").nullToBlank;
const onlyVisibleHistory = require("../../../common/helpers")
  .onlyVisibleHistory;
const addStartStop = require("../../../common/helpers").addStartStop;
const rollup = require("../../../common/helpers").rollup;
const ignitionMileage = require("../../../common/helpers").ignitionMileage;
const mileageChange = require("../../../common/helpers").mileageChange;
const startStopMileage = require("../../../common/helpers").startStopMileage;
const getStatus = require("../../../common/status").getStatus;
const isIdle = require("../../../common/status").isIdle;
const isPark = require("../../../common/status").isPark;
const isStop = require("../../../common/status").isStop;
const isStart = require("../../../common/status").isStart;
const isTow = require("../../../common/status").isTow;

const log = bunyan.createLogger({
  name: "reports"
  // level: 'debug'
});

module.exports = history => {
  history = cleanData(history);
  history = onlyVisibleHistory(history);
  history = mileageChange(history);
  history = addStartStop(history);
  history = startStopMileage(history);

  let startTime = null;
  let mileageStart = NaN;
  let idleDuration = 0;
  let parkedStart = null;
  let lastStop = null;

  history = history.reduce(function(output, current) {
    let last = output[output.length - 1];
    if (isStart(current)) {
      if (last) {
        startTime = last.d; // some mileage can occur on the start, so need to grab the event right before it.
        mileageStart = last.m;
      } else {
        startTime = current.d;
        mileageStart = current.m;
      }
      idleDuration = 0;
      lastStop = null;
    }

    if (
      isIdle(current) &&
      last != null &&
      current.d != null &&
      startTime != null
    ) {
      idleDuration += moment(current.d).diff(last.d) / 1000;
    }

    if (startTime != null && isStop(current)) {
      current.startTime = startTime;
      current.startStopMileage = current.m - mileageStart;
      current.transitTime = moment(current.d).diff(current.startTime) / 1000;
      current.idleDuration = idleDuration;
      lastStop = current;
    } else if (isStop(current)) {
      current.startTime = null;
      current.startStopMileage = 0;
      current.idleDuration = 0;
      startTime = null;
      mileageStart = current.m;
      idleDuration = 0;
      lastStop = current;
    }

    if (lastStop != null && isPark(current)) {
      if (!lastStop.parkedStart) {
        lastStop.parkedStart = current.d;
      }
      lastStop.ad = current.ad;
      lastStop.parkedEnd = current.d;
      lastStop.parkedDuration =
        moment(lastStop.parkedEnd).diff(lastStop.parkedStart) / 1000;
    }

    output.push(current);

    return output;
  }, []);

  history = _.filter(history, isStop);

  return history;
};
