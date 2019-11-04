/* Copyright (c) 2016 Grant Miner */
"use strict";
const test = require("tape");
const _ = require("lodash");
const parse = require("../helper/eventreportparser");
const decimalToHex = require("../listen/decimaltohex");

test("JES (engine status)", function(t) {
  const x =
    "+RESP:GTJES,360303,864251020142968,,gv500,70007F,,1810,1172,27,20,74,41,0,0.0,117,128.4,37.578034,48.719447,20160818170736,,,,,,103.0,20160818170737,00DD$";
  const parsed = parse(x);
  t.plan(18);
  t.equal(parsed.imei, "864251020142968", "imei");
  t.equal(parsed.name, "gv500", "name");
  t.equal(parsed.jes.reportMask, parseInt("70007F", 16), "report mask");
  t.ok(_.isNaN(parsed.jes.journeyConsumption));
  t.equal(parsed.jes.maxRPM, 1810, "maxRPM");
  t.equal(parsed.jes.averageRPM, 1172, "averageRPM");
  t.equal(parsed.jes.maxThrottlePosition, 27, "maxThrottlePosition");
  t.equal(parsed.jes.averageThrottlePosition, 20, "averageThrottlePosition");
  t.equal(parsed.jes.maxEngineLoad, 74, "maxEngineLoad");
  t.equal(parsed.jes.averageEngineLoad, 41, "averageEngineLoad");
  t.equal(parsed.accuracy, 0, "accuracy");
  t.equal(parsed.speed, 0.0, "speed");
  t.equal(parsed.azimuth, 117, "azimuth");
  t.equal(parsed.altitude, 128.4, "altitude");
  t.equal(parsed.longitude, 37.578034);
  t.equal(parsed.latitude, 48.719447);
  t.equal(parsed.mileage, 103.0);
  t.equal(decimalToHex(parsed.count, 4), "00DD", "count");
});

test("Another JES (engine status)", function(t) {
  const x =
    "+RESP:GTJES,360303,864251020143636,,gv500,70007F,,7942,4978,0,0,55,26,0,0.0,74,119.1,32.723300,50.514457,20160817162026,,,,,,103.1,20160817162027,0951$";
  const parsed = parse(x);
  t.plan(18);
  t.equal(parsed.imei, "864251020143636", "imei");
  t.equal(parsed.name, "gv500", "name");
  t.equal(parsed.jes.reportMask, parseInt("70007F", 16), "report mask");
  t.ok(_.isNaN(parsed.jes.journeyConsumption), "journeyConsumption");
  t.equal(parsed.jes.maxRPM, 7942, "maxRPM");
  t.equal(parsed.jes.averageRPM, 4978, "averageRPM");
  t.equal(parsed.jes.maxThrottlePosition, 0, "maxThrottlePosition");
  t.equal(parsed.jes.averageThrottlePosition, 0, "averageThrottlePosition");
  t.equal(parsed.jes.maxEngineLoad, 55, "maxEngineLoad");
  t.equal(parsed.jes.averageEngineLoad, 26, "averageEngineLoad");
  t.equal(parsed.accuracy, 0, "accuracy");
  t.equal(parsed.speed, 0.0, "speed");
  t.equal(parsed.azimuth, 74, "azimuth");
  t.equal(parsed.altitude, 119.1, "altitude");
  t.equal(parsed.longitude, 32.7233);
  t.equal(parsed.latitude, 50.514457);
  t.equal(parsed.mileage, 103.1);
  t.equal(decimalToHex(parsed.count, 4), "0951", "count");
});
