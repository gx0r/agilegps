/* Copyright (c) 2016 Grant Miner */
"use strict";
const test = require("tape");
const _ = require("lodash");
const parse = require("../helper/eventreportparser");
const decimalToHex = require("../listen/decimaltohex");

test("Tractor OBD", function(t) {
  // const x = '+RESP:GTOBD,360100,864251020143040,3LNHL2GC4BR773283,g5,0,79FFFF,3LNHL2GC4BR773283,1,14312,981B81E0,1333,0,8,,65535,0,0,0,,17,49,58,6,40976,0,0.0,0,288.9,-93.399623,44.940529,20160327232242,0310,0260,74B1,9D83,00,278.8,20160327232512,0731$';
  const x =
    "+RESP:GTOBD,360303,864251020143636,,gv500,0,79FFFF,,1,13696,,1800,,82,,,,,,,,29,,A,1,0,15.7,258,116.0,32.727395,50.515312,20160817045847,,,,,,102.4,20160817045849,0909$";
  const parsed = parse(x);
  t.plan(8);
  t.equal(parsed.imei, "864251020143636", "imei");
  t.equal(parsed.name, "gv500", "name");
  t.equal(parsed.rty, "0", "report type");
  t.equal(parsed.reportMask, parseInt("79FFFF", 16), "report mask");
  t.equal(parsed.obd.vin, "", "obd vin");
  // t.equal(parsed.obd.connect, true, 'odb connect');
  // t.equal(parsed.obd.powermV, 14312, 'odb powermV');
  // t.equal(parsed.obd.supportPIDs, '981B81E0', 'support pids');
  // t.equal(parsed.obd.RPMs, 1333, 'RPMs');
  // t.equal(parsed.obd.speed, 15.7, 'OBD speed');
  // t.equal(parsed.obd.temp, 8, 'OBD temp');
  // t.ok(_.isNaN(parsed.obd.fuelConsumption), 'OBD fuel consumption');
  // t.equal(parsed.obd.DTCsClearedDistanceOverVehicleTotalMileage, 65535, 'OBD DTCsClearedDistanceOverVehicleTotalMileage');
  // t.equal(parsed.obd.malfunctionActivatedDistance, 0, 'OBD malfunctionActivatedDistance');
  // t.equal(parsed.obd.malfunction, false, 'OBD malfunction');
  // t.equal(parsed.obd.diagnosticTroubleCodesCount, 0, 'OBD diagnosticTroubleCodesCount');
  // t.equal(parsed.obd.diagnosticTroubleCodes.length,0 , 'OBD diagnosticTroubleCode length 0');
  // t.equal(parsed.obd.throttlePosition, 17, 'OBD throttlePosition');
  t.equal(parsed.obd.engineLoad, 29, "engine load");
  // t.equal(parsed.obd.fuelLevelInput, 58, 'fuel level input');
  t.equal(parsed.mileage, 102.4, "mileage");
  // t.equal(parsed.accuracy, 0, 'accuracy');
  // t.equal(parsed.speed, 0, 'speed');
  // t.equal(parsed.azimuth, 0, 'azimuth');
  // t.equal(parsed.altitude, 288.9, 'altitude');
  // t.equal(parsed.longitude, -93.399623, 'long');
  // t.equal(parsed.latitude, 44.940529, 'lat');
  // t.equal(parsed.mileage, 278.8, 'mileage');
  t.equal(decimalToHex(parsed.count, 4), "0909", "count");
});
