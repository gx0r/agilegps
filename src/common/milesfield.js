/* Copyright (c) 2016 Grant Miner */
"use strict";
let _ = require("lodash");
let tohhmmss = require("./tohhmmss");
let hidenan = require("./hidenan");
let tomiles = require("./tomiles");
let Status = require("./status");

let isIdle = Status.isIdle;
let isPark = Status.isPark;
let isStop = Status.isStop;
let isTow = Status.isTow;

function milesField(item, isKilometers) {
  if (item.igd != null) return tohhmmss(item.igd);
  if (item.idleTime != null) return tohhmmss(item.idleTime / 1000);

  if (_.isFinite(item.mc) && _.isFinite(item.tm)) {
    let mc, tm;
    if (!isKilometers) {
      mc = tomiles(item.mc);
      tm = tomiles(item.tm);
    } else {
      mc = parseFloat(item.mc).toFixed(1);
      tm = parseFloat(item.tm).toFixed(1);
    }

    if (mc === 0) mc = "0.0";
    if (tm === 0) tm = "0.0";

    // return mc + "|" + tm;
    return tm;
  } else {
    return "";
  }
}
module.exports = milesField;
