/* Copyright (c) 2016 Grant Miner */
'use strict';
import test from 'tape';
import _ from 'lodash';
import parse from '../helper/eventreportparser';
import decimalToHex from '../listen/decimaltohex';


test('OBD, 0 malfunctions, 1996 Jeep Grand Cherokee', function (t) {
    const x = '+RESP:GTOBD,360100,864251020143040,,g5,0,79FFFF,,1,12510,983A8000,,,,,,,,,,,,,3,0,0,0.0,82,275.8,-93.295822,44.901657,20160323230656,0310,0260,74AF,AC5A,00,82.6,20160323230658,03EB$';
    const parsed = parse(x);
    t.plan(28);
    t.equal(parsed.name, 'g5', 'name');
    t.equal(parsed.imei, '864251020143040')
    t.equal(parsed.reportMask, 7995391, 'report mask'); // 0x79FFFF
    t.equal(parsed.obd.vin, '', 'obd VIN');
    t.equal(parsed.obd.connect, true, 'obd connected');
    t.equal(parsed.obd.powermV, 12510, 'obd powermv');
    t.equal(parsed.obd.supportPIDs, '983A8000', 'obd pids');
    t.ok(_.isNaN(parsed.obd.RPMs), 'obd rpms');
    t.ok(_.isNaN(parsed.obd.speed), 'obd speed');
    t.ok(_.isNaN(parsed.obd.temp), 'obd temp');
    t.ok(_.isNaN(parsed.obd.fuelConsumption), 'obd fuelConsumption');
    t.ok(_.isNaN(parsed.obd.DTCsClearedDistanceOverVehicleTotalMileage), 'OBD DTCsClearedDistanceOverVehicleTotalMileage');
    t.ok(_.isNaN(parsed.obd.malfunctionActivatedDistance), 'OBD malfunctionActivatedDistance');
    t.equal(parsed.obd.malfunction, false, 'obd manfunction');
    t.ok(_.isNaN(parsed.obd.diagnosticTroubleCodesCount), 'OBD diagnosticTroubleCodesCount');
    t.equal(parsed.obd.diagnosticTroubleCodes.length, 0, 'obd diagnostic codes');
    t.ok(_.isNaN(parsed.obd.throttlePosition), 'obd throttle position');
    t.ok(_.isNaN(parsed.obd.engineLoad), 'obd throttle position');
    t.ok(_.isNaN(parsed.obd.fuelLevelInput), 'obd throttle position');
    t.equal(parsed.obd.mileage, 3, 'obd mileage');
    t.equal(parsed.accuracy, 0, 'accuracy');
    t.equal(parsed.speed, 0, 'speed');
    t.equal(parsed.azimuth, 82, 'azimuth');
    t.equal(parsed.altitude, 275.8, 'altitude');
    t.equal(parsed.longitude, -93.295822);
    t.equal(parsed.latitude, 44.901657);
    t.equal(parsed.mileage, 82.6, 'mileage');
    t.equal(decimalToHex(parsed.count, 4), '03EB');
})

test('OBD, 1 malfunction, 1996 Jeep Grand Cherokee', function (t) {
    const x = '+RESP:GTOBD,360100,864251020143040,,g5,0,79FFFF,,1,13939,983A8000,777,0,56,inf,,,1,1,0138,12,5,,3,0,0,0.0,298,327.8,-93.296048,44.901821,20160323135025,0310,0260,74AF,AC5A,00,60.7,20160323135026,0379$';
    const parsed = parse(x);
    t.plan(28);
    t.equal(parsed.imei, '864251020143040', 'imei')
    t.equal(parsed.name, 'g5', 'name');
    t.equal(parsed.reportMask, 7995391, 'report mask');
    t.equal(parsed.obd.vin, '', 'obd VIN');
    t.equal(parsed.obd.connect, true, 'obd connected');
    t.equal(parsed.obd.powermV, 13939, 'obd powermv');
    t.equal(parsed.obd.supportPIDs, '983A8000', 'obd pids');
    t.equal(parsed.obd.RPMs, 777, 'obd rpms');
    t.equal(parsed.obd.speed, 0, 'obd speed');
    t.equal(parsed.obd.temp, 56, 'obd coolant temp');
    t.equal(parsed.obd.fuelConsumption, Infinity, 'obd fuel consump');
    t.ok(_.isNaN(parsed.obd.DTCsClearedDistanceOverVehicleTotalMileage), 'OBD DTCsClearedDistanceOverVehicleTotalMileage');
    t.ok(_.isNaN(parsed.obd.malfunctionActivatedDistance), 'OBD malfunctionActivatedDistance');
    t.equal(parsed.obd.malfunction, true, 'obd manfunction');
    t.equal(parsed.obd.diagnosticTroubleCodesCount, 1, 'OBD diagnosticTroubleCodesCount');
    t.equal(parsed.obd.diagnosticTroubleCodes[0], '0138', 'obd diagnostic codes');
    t.equal(parsed.obd.throttlePosition, 12, 'obd throttle position');
    t.equal(parsed.obd.engineLoad, 5, 'obd engine load');
    t.ok(_.isNaN(parsed.obd.fuelLevelInput), 'NaN fuel level input');
    t.equal(parsed.obd.mileage, 3, 'obd mileage');
    t.equal(parsed.accuracy, 0, 'accuracy');
    t.equal(parsed.speed, 0, 'speed');
    t.equal(parsed.azimuth, 298, 'azimuth');
    t.equal(parsed.altitude, 327.8, 'altitude');
    t.equal(parsed.longitude, -93.296048, 'long');
    t.equal(parsed.latitude, 44.901821, 'lat');
    t.equal(parsed.mileage, 60.7, 'mileage');
    t.equal(decimalToHex(parsed.count, 4), '0379');
})

test('parse OBD gv500', function (t) {
    const x = '+BUFF:GTOBD,360100,864251020143727,,gv500,0,FFFF,,1,12617,,,,,,,,,,,,,,20160322195018,0108$';
    const parsed = parse(x);
    t.plan(3);
    t.equal(decimalToHex(parsed.count, 4), '0108');
    t.equal(parsed.imei, '864251020143727')
    t.equal(parsed.name, 'gv500');
})


test('long OBD message 2 failure codes', function (t) {
    const x = '+RESP:GTOBD,360100,864251020143040,,g5,0,79FFFF,,1,14022,983A8000,2031,102,96,3.8,,,1,2,0141,0138,25,23,,3,0,0,104.0,269,267.1,-93.269559,44.890825,20160326190646,0310,0260,74AF,A12F,00,155.6,20160326190649,05A6$'
    const parsed = parse(x);
    t.plan(30);
    t.equal(parsed.imei, '864251020143040', 'imei')
    t.equal(parsed.name, 'g5', 'name');
    t.equal(parsed.rty, '0', 'report type');
    t.equal(parsed.reportMask, 7995391, 'report mask');
    t.equal(parsed.obd.vin, '', 'obd vin');
    t.equal(parsed.obd.connect, true, 'odb connect');
    t.equal(parsed.obd.powermV, 14022, 'odb powermV');
    t.equal(parsed.obd.supportPIDs, '983A8000', 'support pids');
    t.equal(parsed.obd.RPMs, 2031, 'RPMs');
    t.equal(parsed.obd.speed, 102, 'OBD speed');
    t.equal(parsed.obd.temp, 96, 'OBD temp');
    t.equal(parsed.obd.fuelConsumption, 3.8, 'OBD fuel consumption');
    t.ok(_.isNaN(parsed.obd.DTCsClearedDistanceOverVehicleTotalMileage), 'OBD DTCsClearedDistanceOverVehicleTotalMileage');
    t.ok(_.isNaN(parsed.obd.malfunctionActivatedDistance), 'OBD malfunctionActivatedDistance');
    t.equal(parsed.obd.malfunction, true, 'OBD malfunction');
    t.equal(parsed.obd.diagnosticTroubleCodesCount, 2, 'OBD diagnosticTroubleCodesCount');
    t.equal(parsed.obd.diagnosticTroubleCodes[0], '0141', 'OBD diagnosticTroubleCode 1');
    t.equal(parsed.obd.diagnosticTroubleCodes[1], '0138', 'OBD diagnosticTroubleCode 2');
    t.equal(parsed.obd.throttlePosition, 25, 'OBD throttlePosition');
    t.equal(parsed.obd.engineLoad, 23, 'engine load');
    t.ok(_.isNaN(parsed.obd.fuelLevelInput), 'fuel level input');
    t.equal(parsed.obd.mileage, 3, 'mileage');
    t.equal(parsed.accuracy, 0, 'accuracy');
    t.equal(parsed.speed, 104.0, 'speed');
    t.equal(parsed.azimuth, 269, 'azimuth');
    t.equal(parsed.altitude, 267.1, 'altitude');
    t.equal(parsed.longitude, -93.269559, 'long');
    t.equal(parsed.latitude, 44.890825, 'lat');
    t.equal(parsed.mileage, 155.6, 'mileage');
    t.equal(decimalToHex(parsed.count, 4), '05A6', 'count');
})

test('2 malfunctions but missing failure codes', function (t) {
    const x = ' +RESP:GTOBD,360100,864251020143040,,g5,0,79FFFF,,1,13880,983A8000,1734,87,95,3.6,,,1,2,,21,18,,3,0,0,88.2,228,277.9,-93.325287,44.888686,20160327010551,0310,0260,74AF,9DB3,00,168.9,20160327010553,0618$';
    const parsed = parse(x);
    t.plan(29);
    t.equal(parsed.imei, '864251020143040', 'imei')
    t.equal(parsed.name, 'g5', 'name');
    t.equal(parsed.rty, '0', 'report type');
    t.equal(parsed.reportMask, 7995391, 'report mask');
    t.equal(parsed.obd.vin, '', 'obd vin');
    t.equal(parsed.obd.connect, true, 'odb connect');
    t.equal(parsed.obd.powermV, 13880, 'odb powermV');
    t.equal(parsed.obd.supportPIDs, '983A8000', 'support pids');
    t.equal(parsed.obd.RPMs, 1734, 'RPMs');
    t.equal(parsed.obd.speed, 87, 'OBD speed');
    t.equal(parsed.obd.temp, 95, 'OBD temp');
    t.equal(parsed.obd.fuelConsumption, 3.6, 'OBD fuel consumption');
    t.ok(_.isNaN(parsed.obd.DTCsClearedDistanceOverVehicleTotalMileage), 'OBD DTCsClearedDistanceOverVehicleTotalMileage');
    t.ok(_.isNaN(parsed.obd.malfunctionActivatedDistance), 'OBD malfunctionActivatedDistance');
    t.equal(parsed.obd.malfunction, true, 'OBD malfunction');
    t.equal(parsed.obd.diagnosticTroubleCodesCount, 2, 'OBD diagnosticTroubleCodesCount');
    t.equal(parsed.obd.diagnosticTroubleCodes.length,0 , 'OBD diagnosticTroubleCode length 0');
    t.equal(parsed.obd.throttlePosition, 21, 'OBD throttlePosition');
    t.equal(parsed.obd.engineLoad, 18, 'engine load');
    t.ok(_.isNaN(parsed.obd.fuelLevelInput), 'fuel level input');
    t.equal(parsed.obd.mileage, 3, 'mileage');
    t.equal(parsed.accuracy, 0, 'accuracy');
    t.equal(parsed.speed, 88.2, 'speed');
    t.equal(parsed.azimuth, 228, 'azimuth');
    t.equal(parsed.altitude, 277.9, 'altitude');
    t.equal(parsed.longitude, -93.325287, 'long');
    t.equal(parsed.latitude, 44.888686, 'lat');
    t.equal(parsed.mileage, 168.9, 'mileage');
    t.equal(decimalToHex(parsed.count, 4), '0618', 'count');
})

// +RESP:GTOBD,360100,864251020143040,,g5,0,79FFFF,,1,13872,983A8000,1661,56,96,,,,1,2,0141,0138,27,21,,3,0,0,89.8,1,281.9,-93.349840,44.896393,20160327010751,0310,0260,74B1,9CA7,00,171.6,20160327010753,061E$
// +RESP:GTOBD,360100,864251020143040,,g5,0,79FFFF,,1,13853,983A8000,1610,85,99,2.4,,,1,2,0141,0138,24,21,,3,0,0,89.9,2,287.4,-93.349335,44.921277,20160327010951,0310,0260,74B1,B434,00,174.4,20160327010953,0620$

test('fuel level input Chevy Silverado', function (t) {
    const x = '+RESP:GTOBD,360100,864251020143040,1GCEK19J48Z137290,g5,0,79FFFF,1GCEK19J48Z137290,1,14871,983B81E0,771,0,11,inf,24559,0,0,0,,25,29,38,6,0,0,,,,,,,0310,0260,74B1,9D83,00,278.8,20160327231033,072F$';
    const parsed = parse(x);
    t.plan(23);
    t.equal(parsed.imei, '864251020143040', 'imei')
    t.equal(parsed.name, 'g5', 'name');
    t.equal(parsed.rty, '0', 'report type');
    t.equal(parsed.reportMask, 7995391, 'report mask');
    t.equal(parsed.obd.vin, '1GCEK19J48Z137290', 'obd vin');
    t.equal(parsed.obd.connect, true, 'odb connect');
    t.equal(parsed.obd.powermV, 14871, 'odb powermV');
    t.equal(parsed.obd.supportPIDs, '983B81E0', 'support pids');
    t.equal(parsed.obd.RPMs, 771, 'RPMs');
    t.equal(parsed.obd.speed, 0, 'OBD speed');
    t.equal(parsed.obd.temp, 11, 'OBD temp');
    t.equal(parsed.obd.fuelConsumption, Infinity, 'OBD fuel consumption');
    t.equal(parsed.obd.DTCsClearedDistanceOverVehicleTotalMileage, 24559, 'OBD DTCsClearedDistanceOverVehicleTotalMileage');
    t.equal(parsed.obd.malfunctionActivatedDistance, 0, 'OBD malfunctionActivatedDistance');
    t.equal(parsed.obd.malfunction, false, 'OBD malfunction');
    t.equal(parsed.obd.diagnosticTroubleCodesCount, 0, 'OBD diagnosticTroubleCodesCount');
    t.equal(parsed.obd.diagnosticTroubleCodes.length,0 , 'OBD diagnosticTroubleCode length 0');
    t.equal(parsed.obd.throttlePosition, 25, 'OBD throttlePosition');
    t.equal(parsed.obd.engineLoad, 29, 'engine load');
    t.equal(parsed.obd.fuelLevelInput, 38, 'fuel level input');
    t.equal(parsed.obd.mileage, 6, 'mileage');
    t.equal(parsed.mileage, 278.8, 'mileage');
    t.equal(decimalToHex(parsed.count, 4), '072F', 'count');
})

test('another fuel level input Lincoln MKZ', function (t) {
    const x = '+RESP:GTOBD,360100,864251020143040,3LNHL2GC4BR773283,g5,0,79FFFF,3LNHL2GC4BR773283,1,14312,981B81E0,1333,0,8,,65535,0,0,0,,17,49,58,6,40976,0,0.0,0,288.9,-93.399623,44.940529,20160327232242,0310,0260,74B1,9D83,00,278.8,20160327232512,0731$';
    const parsed = parse(x);
    t.plan(29);
    t.equal(parsed.imei, '864251020143040', 'imei')
    t.equal(parsed.name, 'g5', 'name');
    t.equal(parsed.rty, '0', 'report type');
    t.equal(parsed.reportMask, 7995391, 'report mask');
    t.equal(parsed.obd.vin, '3LNHL2GC4BR773283', 'obd vin');
    t.equal(parsed.obd.connect, true, 'odb connect');
    t.equal(parsed.obd.powermV, 14312, 'odb powermV');
    t.equal(parsed.obd.supportPIDs, '981B81E0', 'support pids');
    t.equal(parsed.obd.RPMs, 1333, 'RPMs');
    t.equal(parsed.obd.speed, 0, 'OBD speed');
    t.equal(parsed.obd.temp, 8, 'OBD temp');
    t.ok(_.isNaN(parsed.obd.fuelConsumption), 'OBD fuel consumption');
    t.equal(parsed.obd.DTCsClearedDistanceOverVehicleTotalMileage, 65535, 'OBD DTCsClearedDistanceOverVehicleTotalMileage');
    t.equal(parsed.obd.malfunctionActivatedDistance, 0, 'OBD malfunctionActivatedDistance');
    t.equal(parsed.obd.malfunction, false, 'OBD malfunction');
    t.equal(parsed.obd.diagnosticTroubleCodesCount, 0, 'OBD diagnosticTroubleCodesCount');
    t.equal(parsed.obd.diagnosticTroubleCodes.length,0 , 'OBD diagnosticTroubleCode length 0');
    t.equal(parsed.obd.throttlePosition, 17, 'OBD throttlePosition');
    t.equal(parsed.obd.engineLoad, 49, 'engine load');
    t.equal(parsed.obd.fuelLevelInput, 58, 'fuel level input');
    t.equal(parsed.obd.mileage, 6, 'mileage');
    t.equal(parsed.accuracy, 0, 'accuracy');
    t.equal(parsed.speed, 0, 'speed');
    t.equal(parsed.azimuth, 0, 'azimuth');
    t.equal(parsed.altitude, 288.9, 'altitude');
    t.equal(parsed.longitude, -93.399623, 'long');
    t.equal(parsed.latitude, 44.940529, 'lat');
    t.equal(parsed.mileage, 278.8, 'mileage');
    t.equal(decimalToHex(parsed.count, 4), '0731', 'count');
})

test('Honda CRV OBD 360303', function (t) {
    const parsed = parse('+RESP:GTOBD,360303,864251020143594,,gv500,0,79FFFF,,1,14125,983A8000,2682,72,91,22.9,,,1,4,1259032501710133,26,68,,3,1,0,80.2,66,65.9,37.521339,49.030879,20161017124818,,,,,,31.3,20161017124821,0150$');
	t.plan(29);
    t.equal(parsed.imei, '864251020143594', 'imei')
    t.equal(parsed.name, 'gv500', 'name');
    t.equal(parsed.rty, '0', 'report type');
    t.equal(parsed.reportMask, parseInt('79FFFF', 16), 'report mask');
    t.equal(parsed.obd.vin, '', 'obd vin');
    t.equal(parsed.obd.connect, true, 'odb connect');
    t.equal(parsed.obd.powermV, 14125, 'odb powermV');
    t.equal(parsed.obd.supportPIDs, '983A8000', 'support pids');
    t.equal(parsed.obd.RPMs, 2682, 'RPMs');
    t.equal(parsed.obd.speed, 72, 'OBD speed');
    t.equal(parsed.obd.temp, 91, 'OBD temp');
    t.equal(parsed.obd.fuelConsumption, 22.9, 'OBD fuel consumption');
    t.ok(_.isNaN(parsed.obd.DTCsClearedDistanceOverVehicleTotalMileage), 'OBD DTCsClearedDistanceOverVehicleTotalMileage');
    t.ok(_.isNaN(parsed.obd.malfunctionActivatedDistance), 'OBD malfunctionActivatedDistance');
    t.equal(parsed.obd.malfunction, true, 'OBD malfunction');
    t.equal(parsed.obd.diagnosticTroubleCodesCount, 4, 'OBD diagnosticTroubleCodesCount');
    t.equal(parsed.obd.diagnosticTroubleCodes.length, 4, 'OBD diagnosticTroubleCode length 4');
    t.equal(parsed.obd.throttlePosition, 26, 'OBD throttlePosition');
    t.equal(parsed.obd.engineLoad, 68, 'engine load');
    t.ok(_.isNaN(parsed.obd.fuelLevelInput), 'fuel level input');
    t.equal(parsed.obd.mileage, 3, 'mileage');
    t.equal(parsed.accuracy, 0, 'accuracy');
    t.equal(parsed.speed, 80.2, 'speed');
    t.equal(parsed.azimuth, 66, 'azimuth');
    t.equal(parsed.altitude, 65.9, 'altitude');
    t.equal(parsed.longitude, 37.521339, 'long');
    t.equal(parsed.latitude, 49.030879, 'lat');
    t.equal(parsed.mileage, 31.3, 'mileage');
    t.equal(decimalToHex(parsed.count, 4), '0150', 'count');
})

test('Honda CRV OBD new firmware', function (t) {
    const parsed = parse('+RESP:GTOBD,360402,864251020143594,,gv500,0,79FFFF,,1,14360,983A8000,1709,34,87,23.4,,,1,4,1259032501710133,20,65,,3,1,0,41.6,355,73.9,37.511269,49.018711,20161018123455,,,,,,62.8,20161018123458,002C$');
	t.plan(29);
    t.equal(parsed.imei, '864251020143594', 'imei')
    t.equal(parsed.name, 'gv500', 'name');
    t.equal(parsed.rty, '0', 'report type');
    t.equal(parsed.reportMask, parseInt('79FFFF', 16), 'report mask');
    t.equal(parsed.obd.vin, '', 'obd vin');
    t.equal(parsed.obd.connect, true, 'odb connect');
    t.equal(parsed.obd.powermV, 14360, 'odb powermV');
    t.equal(parsed.obd.supportPIDs, '983A8000', 'support pids');
    t.equal(parsed.obd.RPMs, 1709, 'RPMs');
    t.equal(parsed.obd.speed, 34, 'OBD speed');
    t.equal(parsed.obd.temp, 87, 'OBD temp');
    t.equal(parsed.obd.fuelConsumption, 23.4, 'OBD fuel consumption');
    t.ok(_.isNaN(parsed.obd.DTCsClearedDistanceOverVehicleTotalMileage), 'OBD DTCsClearedDistanceOverVehicleTotalMileage');
    t.ok(_.isNaN(parsed.obd.malfunctionActivatedDistance), 'OBD malfunctionActivatedDistance');
    t.equal(parsed.obd.malfunction, true, 'OBD malfunction');
    t.equal(parsed.obd.diagnosticTroubleCodesCount, 4, 'OBD diagnosticTroubleCodesCount');
    t.equal(parsed.obd.diagnosticTroubleCodes.length, 4, 'OBD diagnosticTroubleCode length 4');
    t.equal(parsed.obd.throttlePosition, 20, 'OBD throttlePosition');
    t.equal(parsed.obd.engineLoad, 65, 'engine load');
    t.ok(_.isNaN(parsed.obd.fuelLevelInput), 'fuel level input');
    t.equal(parsed.obd.mileage, 3, 'mileage');
    t.equal(parsed.accuracy, 0, 'accuracy');
    t.equal(parsed.speed, 41.6, 'speed');
    t.equal(parsed.azimuth, 355, 'azimuth');
    t.equal(parsed.altitude, 73.9, 'altitude');
    t.equal(parsed.longitude, 37.511269, 'long');
    t.equal(parsed.latitude, 49.018711, 'lat');
    t.equal(parsed.mileage, 62.8, 'mileage');
    t.equal(decimalToHex(parsed.count, 4), '002C', 'count');
})
