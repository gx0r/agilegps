/* Copyright (c) 2016 Grant Miner */
"use strict";
const isNaN = require("lodash").isNaN;
const isFinite = require("lodash").isFinite;
const get = require("lodash").get;
const bunyan = require("bunyan");

const containsMotionInformation = require("../../../common/helpers")
  .containsMotionInformation;
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
const isMotion = require("../../../common/helpers").isMotion;

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
  let result = Object.create(null);

  history = cleanData(history);
  history = history.filter(containsMotionInformation);
  history = mileageChange(history);
  history = ignitionMileage(history);
  history = rollup(history);

  let beginOdometer = NaN;
  let endOdometer = NaN;
  let totalTransit = 0;

  let parks = [];
  let idles = [];

  history.reduce((output, current, idx, array) => {
    if (isNaN(beginOdometer) && !isNaN(current.m)) {
      beginOdometer = current.m;
    }

    if (!isNaN(current.m)) {
      endOdometer = current.m;
    }

    if (getStatus(current) === "Parked") {
      parks.push(current.idleTime);
    }

    if (getStatus(current) === "Idling") {
      idles.push(current.idleTime);
    }

    let prev = array[idx - 1];
    if (prev && isMotion(current)) {
      let dur =
        (new Date(current.d).valueOf() - new Date(prev.d).valueOf()) / 1000;
      totalTransit += dur;
    }
  }, []);

  let totalIdle = 0;
  idles.forEach(function(dur) {
    if (isFinite(dur)) {
      totalIdle += dur / 1000;
    }
  });

  let totalPark = 0;
  parks.forEach(function(dur) {
    if (isFinite(dur)) {
      totalPark += dur / 1000;
    }
  });

  let avgIdle = totalIdle / idles.length;
  let avgPark = totalPark / parks.length;

  if (!isFinite(avgIdle)) {
    avgIdle = 0;
  }
  if (!isFinite(avgPark)) {
    avgPark = 0;
  }

  return {
    parks: parks.length,
    idles: idles.length,
    totalIdle: totalIdle,
    totalPark: totalPark,
    avgIdle: avgIdle,
    avgPark: avgPark,
    beginOdometer: beginOdometer,
    endOdometer: endOdometer,
    distance: endOdometer - beginOdometer,
    totalTransit: totalTransit
  };
};
