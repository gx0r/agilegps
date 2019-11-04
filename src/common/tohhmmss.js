/* Copyright (c) 2016 Grant Miner */
"use strict";
module.exports = function(seconds) {
  let sec_num = parseInt(seconds, 10); // don't forget the second param
  let hours = Math.floor(sec_num / 3600);
  let minutes = Math.floor((sec_num % 3600) / 60);
  seconds = Math.floor(sec_num % 60);

  if (hours < 10) {
    hours = "0" + hours;
  }
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  let time = hours + ":" + minutes + ":" + seconds;
  return time;
};
