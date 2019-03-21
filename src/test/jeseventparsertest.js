/* Copyright (c) 2016 Grant Miner */
'use strict';
const test = require('tape');
const _ = require('lodash');
const parse = require('../helper/eventreportparser');
const decimalToHex = require('../listen/decimaltohex');

// test('JES (engine status)', function (t) {
//     const x = '+RESP:GTJES,360303,864251020142968,,gv500,70007F,,1810,1172,27,20,74,41,0,0.0,117,128.4,37.578034,48.719447,20160818170736,,,,,,103.0,20160818170737,00DD$';
//     const parsed = parse(x);
//     t.plan(29);
//     t.equal(parsed.imei, '864251020142968', 'imei')
//     t.equal(parsed.name, 'gv500', 'name');
//     t.equal(parsed.reportMask, parseInt('70007F', 16), 'report mask');
//     t.equal(parsed.journeyConsumption, , 'journeyConsumption');
//     t.equal(parsed.maxRPM, 1810, 'maxRPM');
//     t.equal(parsed.averageRPM, 1172, 'averageRPM');
//     t.equal(parsed.maxThrottlePosition, 27, 'maxThrottlePosition');
//     t.equal(parsed.averageThrottlePosition, 20, 'averageThrottlePosition');
//     t.equal(parsed.maxEngineLoad, 74, 'maxEngineLoad');
//     t.equal(parsed.averageEngineLoad, 41, 'averageEngineLoad');
//     t.equal(parsed.accuracy, 0, 'accuracy');
//     t.equal(parsed.speed, 0.0, 'speed');
//     t.equal(parsed.azimuth, 117, 'azimuth');
//     t.equal(parsed.altitude, 128.4, 'altitude');
//     t.equal(parsed.longitude, 37.578034);
//     t.equal(parsed.latitude, 48.719447);
//     t.equal(decimalToHex(parsed.count, 4), '00DD', 'count');
// })

//
// test('Another JES (engine status)', function (t) {
//     const x = '+RESP:GTJES,360303,864251020143636,,gv500,70007F,,7942,4978,0,0,55,26,0,0.0,74,119.1,32.723300,50.514457,20160817162026,,,,,,103.1,20160817162027,0951$';
//     const parsed = parse(x);
//     t.plan(29);
//     t.equal(parsed.imei, '864251020142968', 'imei')
//     t.equal(parsed.name, 'gv500', 'name');
//     t.equal(parsed.reportMask, parseInt('70007F', 16), 'report mask');
//     t.equal(parsed.journeyConsumption, , 'journeyConsumption');
//     t.equal(parsed.maxRPM, 7942, 'maxRPM');
//     t.equal(parsed.averageRPM, 4978, 'averageRPM');
//     t.equal(parsed.maxThrottlePosition, 00, 'maxThrottlePosition');
//     t.equal(parsed.averageThrottlePosition, 0, 'averageThrottlePosition');
//     t.equal(parsed.maxEngineLoad, 55, 'maxEngineLoad');
//     t.equal(parsed.averageEngineLoad, 26, 'averageEngineLoad');
//     t.equal(parsed.accuracy, 0, 'accuracy');
//     t.equal(parsed.speed, 0.0, 'speed');
//     t.equal(parsed.azimuth, 74, 'azimuth');
//     t.equal(parsed.altitude, 119.1, 'altitude');
//     t.equal(parsed.longitude, 32.723300);
//     t.equal(parsed.latitude, 50.514457);
//     t.equal(decimalToHex(parsed.count, 4), '0951', 'count');
// })
