/* Copyright (c) 2016 Grant Miner */
"use strict";
const test = require("tape");
const decimalToHex = require("../listen/decimaltohex");

test("test", function(t) {
  t.plan(1);

  const hex = decimalToHex(108);
  t.equal(hex, "6C");
});
