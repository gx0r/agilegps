/* Copyright (c) 2016 Grant Miner */
"use strict";
module.exports = (history, threshold) =>
  history.filter(item => item.s > threshold);
