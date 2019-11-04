/* Copyright (c) 2016 Grant Miner */

"use strict";
function tzOffset() {
  return new Date().getTimezoneOffset();
}

let cache = {};

function isDST() {
  return new Date().getTimezoneOffset() < stdTimezoneOffset();
}

function stdTimezoneOffset() {
  let fy = new Date().getFullYear();
  if (!cache.hasOwnProperty(fy)) {
    let maxOffset = new Date(fy, 0, 1).getTimezoneOffset();
    let monthsTestOrder = [6, 7, 5, 8, 4, 9, 3, 10, 2, 11, 1];
    for (let mi = 0; mi < 12; mi++) {
      let offset = new Date(fy, monthsTestOrder[mi], 1).getTimezoneOffset();
      if (offset != maxOffset) {
        maxOffset = Math.max(maxOffset, offset);
        break;
      }
    }
    cache[fy] = maxOffset;
  }
  return cache[fy];
}

module.exports = tzOffset;
