/* Copyright (c) 2016 Grant Miner */
"use strict";
let KilometersToMiles = require("kilometers-to-miles");
let ktm = new KilometersToMiles();
let _ = require("lodash");
module.exports = function(value) {
  if (!_.isFinite(value)) {
    return "";
  } else {
    return parseFloat(ktm.get(value).toFixed(1));
  }
};
