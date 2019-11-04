/* Copyright (c) 2016 Grant Miner */
"use strict";
module.exports = function(value) {
  if (isNaN(value)) {
    return "";
  } else {
    return value;
  }
};
