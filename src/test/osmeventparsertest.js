/* Copyright (c) 2016 Grant Miner */
'use strict';
import test from 'tape';
import _ from 'lodash';
import parse from '../helper/eventreportparser';
import decimalToHex from '../listen/decimaltohex';


test('OSM message, no failure codes', function (t) {
    const x = '+RESP:GTOSM,360100,864251020143727,,gv500,3,0,78FFFF,WVGZZZ1TZCW092623,1,14402,983A81C0,1605,37,86,13.8,3087,0,0,0,,15,22,,21,0,40.7,299,136.2,37.579901,48.720192,20160324142307,,,,,,0.0,20160324142309,0A98$'
    const parsed = parse(x);
    t.plan(30);
    t.equal(parsed.imei, '864251020143727', 'imei')
    t.equal(parsed.name, 'gv500', 'name');
    t.equal(parsed.rid, '3', 'record id');
    t.equal(parsed.rty, '0', 'report type');
    t.equal(parsed.reportMask, 7929855, 'report mask'); // 0x78FFFF
    t.equal(parsed.obd.vin, 'WVGZZZ1TZCW092623', 'obd vin');
    t.equal(parsed.obd.connect, true, 'odb connect');
    t.equal(parsed.obd.powermV, 14402, 'odb powermV');
    t.equal(parsed.obd.supportPIDs, '983A81C0', 'support pids');
    t.equal(parsed.obd.RPMs, 1605, 'RPMs');
    t.equal(parsed.obd.speed, 37, 'OBD speed');
    t.equal(parsed.obd.temp, 86, 'OBD temp');
    t.equal(parsed.obd.fuelConsumption, 13.8, 'OBD fuel consumption');
    t.equal(parsed.obd.DTCsClearedDistanceOverVehicleTotalMileage, 3087, 'OBD DTCsClearedDistanceOverVehicleTotalMileage');
    t.equal(parsed.obd.malfunctionActivatedDistance, 0, 'OBD malfunctionActivatedDistance');
    t.equal(parsed.obd.malfunction, false, 'OBD malfunction');
    t.equal(parsed.obd.diagnosticTroubleCodesCount, 0, 'OBD diagnosticTroubleCodesCount');
    t.equal(parsed.obd.diagnosticTroubleCodes.length, 0, 'OBD diagnosticTroubleCodes');
    t.equal(parsed.obd.throttlePosition, 15, 'OBD throttlePosition');
    t.equal(parsed.obd.engineLoad, 22, 'engine load');
    t.ok(_.isNaN(parsed.obd.fuelLevelInput), 'fuel level input');
    t.equal(parsed.obd.mileage, 21, 'mileage');
    t.equal(parsed.accuracy, 0, 'accuracy');
    t.equal(parsed.speed, 40.7, 'speed');
    t.equal(parsed.azimuth, 299, 'azimuth');
    t.equal(parsed.altitude, 136.2, 'altitude');
    t.equal(parsed.longitude, 37.579901, 'long');
    t.equal(parsed.latitude, 48.720192, 'lat');
    t.equal(parsed.mileage, 0, 'mileage');
    t.equal(decimalToHex(parsed.count, 4), '0A98', 'count');
})


test('parse short OSM message', function (t) {
    const x = '+RESP:GTOSM,360100,864251020143727,,gv500,0,0,FFFF,WVGZZZ1TZCW092623,1,14436,983A81C0,782,0,86,inf,3087,0,0,0,,11,12,,20160324142335,0A9B$'
    const parsed = parse(x);
    t.plan(4);
    t.equal(decimalToHex(parsed.count, 4), '0A9B');
    t.equal(parsed.imei, '864251020143727')
    t.equal(parsed.name, 'gv500');
    t.equal(parsed.obd.vin, 'WVGZZZ1TZCW092623');
})


test('another OSM no failure codes', function (t) {
    const x = '+RESP:GTOSM,360100,864251020143727,,gv500,0,0,FFFF,WVGZZZ1TZCW092623,1,14459,983A81C0,1015,0,20,inf,3066,0,0,0,,13,18,,20160324100329,0899$';
    const parsed = parse(x);
    t.plan(22);
    t.equal(parsed.imei, '864251020143727', 'imei')
    t.equal(parsed.name, 'gv500', 'name');
    t.equal(parsed.rid, '0', 'record id');
    t.equal(parsed.rty, '0', 'report type');
    t.equal(parsed.reportMask, 65535, 'report mask');
    t.equal(parsed.obd.vin, 'WVGZZZ1TZCW092623', 'obd vin');
    t.equal(parsed.obd.connect, true, 'odb connect');
    t.equal(parsed.obd.powermV, 14459, 'odb powermV');
    t.equal(parsed.obd.supportPIDs, '983A81C0', 'support pids');
    t.equal(parsed.obd.RPMs, 1015, 'RPMs');
    t.equal(parsed.obd.speed, 0, 'OBD speed');
    t.equal(parsed.obd.temp, 20, 'OBD temp');
    t.equal(parsed.obd.fuelConsumption, Infinity, 'OBD fuel consumption');
    t.equal(parsed.obd.DTCsClearedDistanceOverVehicleTotalMileage, 3066, 'OBD DTCsClearedDistanceOverVehicleTotalMileage');
    t.equal(parsed.obd.malfunctionActivatedDistance, 0, 'OBD malfunctionActivatedDistance');
    t.equal(parsed.obd.malfunction, false, 'OBD malfunction');
    t.equal(parsed.obd.diagnosticTroubleCodesCount, 0, 'OBD diagnosticTroubleCodesCount');
    t.equal(parsed.obd.diagnosticTroubleCodes.length, 0, 'OBD diagnosticTroubleCodes');
    t.equal(parsed.obd.throttlePosition, 13, 'OBD throttlePosition');
    t.equal(parsed.obd.engineLoad, 18, 'engine load');
    t.ok(_.isNaN(parsed.obd.fuelLevelInput), 'fuel level input');
    // t.equal(parsed.obd.mileage, 21, 'mileage');
    // t.equal(parsed.accuracy, 0, 'accuracy');
    // t.equal(parsed.speed, 40.7, 'speed');
    // t.equal(parsed.azimuth, 299, 'azimuth');
    // t.equal(parsed.altitude, 136.2, 'altitude');
    // t.equal(parsed.longitude, 37.579901, 'long');
    // t.equal(parsed.latitude, 48.720192, 'lat');
    // t.equal(parsed.mileage, 0, 'mileage');
    t.equal(decimalToHex(parsed.count, 4), '0899', 'count');
})


test('was parsing incorrect azimuth on OSM message', function (t) {
    const parsed = parse('+RESP:GTOSM,360100,864251020145193,,,8,0,C0D0,1429,89,,21,94,20160406221831,01F3$');
    t.plan(8)
    t.equal(parsed.azimuth, undefined, 'no azimuth');
    t.equal(parsed.reportMask, parseInt('C0D0', 16), 'reportMask');
    t.equal(parsed.obd.RPMs, 1429, 'RPMs');
    t.equal(parsed.obd.temp, 89, 'temp');
    t.ok(_.isNaN(parsed.obd.fuelConsumption), 'fuelConsumption NaN');
    t.equal(parsed.obd.engineLoad, 21, 'engineLoad');
    t.equal(parsed.obd.fuelLevelInput, 94, 'fuelLevelInput');
    t.equal(decimalToHex(parsed.count, 4), '01F3', 'count');
})

test('Mazda OSM', function (t) {
    const parsed = parse('+RESP:GTOSM,360100,864251020145193,,,8,0,C0D0,2039,86,15.5,78,38,20160408201518,0557$');
    t.plan(8)
    t.equal(parsed.azimuth, undefined, 'no azimuth');
    t.equal(parsed.reportMask, parseInt('C0D0', 16), 'reportMask');
    t.equal(parsed.obd.RPMs, 2039, 'RPMs');
    t.equal(parsed.obd.temp, 86, 'temp');
    t.equal(parsed.obd.fuelConsumption, 15.5, 'fuelConsumption');
    t.equal(parsed.obd.engineLoad, 78, 'engineLoad');
    t.equal(parsed.obd.fuelLevelInput, 38, 'fuelLevelInput');
    t.equal(decimalToHex(parsed.count, 4), '0557', 'count');
})
