/* Copyright (c) 2016 Grant Miner */
"use strict";
const _ = require("lodash");
const windrose = require("windrose");

/* Takes azimuth; returns compass direction. */
module.exports = function(item) {
  if (!_.isFinite(item.a)) {
    return "";
  }

  let point = windrose.getPoint(item.a, {
    depth: 1
  });
  if (!point) {
    console.error("bad azimuth on " + JSON.stringify(item));
  } else {
    return point.symbol;
  }
};
