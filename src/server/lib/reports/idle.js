/* Copyright (c) 2016 Grant Miner */
"use strict";
const _ = require("lodash");
const get = require("lodash").get;
const bunyan = require("bunyan");
const Promise = require("bluebird");
const moment = require("moment");
const cleanData = require("../../../common/helpers").cleanData;
const rollup = require("../../../common/helpers").rollup;
const isIdle = require("../../../common/status").isIdle;

const log = bunyan.createLogger({
  name: "reports",
  level: "debug"
});

module.exports = history => {
  let result = Object.create(null);
  history = cleanData(history);
  history = history.filter(
    item => item.cmd === "FRI" || item.cmd === "IGN" || item.cmd === "IGF"
  );
  history = rollup(history);
  history = history.filter(isIdle);

  result.results = history;
  result.totals = history.reduce(function(prev, curr) {
    return prev + curr.idleTime;
  }, 0);

  return result;
};
