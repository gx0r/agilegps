/* Copyright (c) 2016 Grant Miner */
"use strict";

/*
 Simple promise catch handler that just displays an alert.
 */
module.exports = function(result) {
  const st = JSON.stringify(result);
  console.error(st);

  if (result.message) {
    window.alert(result.message);
  } else {
    window.alert(st);
  }
};
