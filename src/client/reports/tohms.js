/* Copyright (c) 2016 Grant Miner */
"use strict";
const _ = require("lodash");

module.exports = function(seconds) {
  if (!_.isFinite(seconds)) {
    return "";
  }

  const sec_num = parseInt(seconds, 10); // don't forget the second param
  let hours = Math.floor(sec_num / 3600);
  const minutes = Math.floor((sec_num % 3600) / 60);
  seconds = Math.floor(sec_num % 60);
  const days = Math.floor(hours / 24);

  if (hours >= 24) {
    hours = hours - days * 24;
  }

  // if (hours < 10) {
  // 	hours = "0" + hours;
  // }
  // if (minutes < 10) {
  // 	minutes = "0" + minutes;
  // }
  // if (seconds < 10) {
  // 	seconds = "0" + seconds;
  // }
  const time =
    (days > 0 ? days + "d " : "") +
    hours +
    "h " +
    minutes +
    "m " +
    seconds +
    "s";
  return time;
};
