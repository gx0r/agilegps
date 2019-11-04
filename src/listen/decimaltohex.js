/* Copyright (c) 2016 Grant Miner */
"use strict";
function decimalToHex(d, padding) {
  let hex = Number(d).toString(16);
  padding =
    typeof padding === "undefined" || padding === null
      ? (padding = 2)
      : padding;

  while (hex.length < padding) {
    hex = "0" + hex;
  }

  return new String(hex).toUpperCase();
}

module.exports = decimalToHex;
