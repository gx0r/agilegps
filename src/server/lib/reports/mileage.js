/* Copyright (c) 2016 Grant Miner */
"use strict";
const isFinite = require("lodash").isFinite;
const get = require("lodash").get;
const bunyan = require("bunyan");
const Promise = require("bluebird");
const moment = require("moment");
const cleanData = require("../../../common/helpers").cleanData;
const mileageChange = require("../../../common/helpers").mileageChange;
const displayState = require("../../../common/addressdisplay").state;

const log = bunyan.createLogger({
  name: "reports"
  // level: 'debug'
});

module.exports = (history, totals) => {
  history = history.filter(item => item.la != null && item.lo != null);

  history = cleanData(history);
  history = mileageChange(history);

  let mileageByState = Object.create(null);

  history.forEach(function(item) {
    if (isFinite(item.mc) && item.mc > 0) {
      let state = displayState(item) || "Unknown";

      if (mileageByState[state] == null) {
        mileageByState[state] = 0;
      }
      if (totals[state] == null) {
        totals[state] = 0;
      }

      mileageByState[state] += item.mc;
      totals[state] += item.mc;
    }
  });

  return mileageByState;
};
