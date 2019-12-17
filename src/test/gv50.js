
/* Copyright (c) 2016 Grant Miner */
"use strict";
const test = require("tape");
const _ = require("lodash");
const parse = require("../helper/eventreportparser");
const decimalToHex = require("../listen/decimaltohex");

test("GV50", function(t) {
  // const x = '+RESP:GTOBD,360100,864251020143040,3LNHL2GC4BR773283,g5,0,79FFFF,3LNHL2GC4BR773283,1,14312,981B81E0,1333,0,8,,65535,0,0,0,,17,49,58,6,40976,0,0.0,0,288.9,-93.399623,44.940529,20160327232242,0310,0260,74B1,9D83,00,278.8,20160327232512,0731$';
  const x =
  "+RESP:GTFRI,FE110A,868446032552909,,,10,1,4,0.0,0,133.6,-76.216093,40.086257,20191217021640,0310,0410,0006,0066180F,,255720.3,,53,110000,,,20191217021640,4168$";

  const parsed = parse(x);
  t.plan(2);
  console.log(parsed)
  t.equal(parsed.imei, "868446032552909", "imei");
  t.equal(decimalToHex(parsed.count, 4), "4168", "count");
});
