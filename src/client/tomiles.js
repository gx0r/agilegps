/* Copyright (c) 2016 Grant Miner */
"use strict";
const KilometersToMiles = require("kilometers-to-miles");
const ktm = new KilometersToMiles();
const _ = require("lodash");
const isUserMetric = require("./isUserMetric");

module.exports = function(value) {
  value = parseFloat(value);
  if (!_.isFinite(value)) {
    return "";
  }
  if (isUserMetric()) {
    return parseFloat(value.toFixed(1));
  } else {
    return parseFloat(ktm.get(value).toFixed(1));
  }
};
