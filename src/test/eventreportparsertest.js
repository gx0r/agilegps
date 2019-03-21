/* Copyright (c) 2016 Grant Miner */
'use strict';
const test = require('tape');
const parse = require('../helper/eventreportparser');
const decimalToHex = require('../listen/decimaltohex');

// https://lodash.com/docs
const _ = require('lodash')

test('parse GTPNA', function (t) {
    t.plan(4); // Tell tape how many assertions we plan to test.
    // This is needed in case some tests are asynchronous, so tape knows when to be done.
    const x = '+RESP:GTPNA,060100,135790246811220,,20090214093254,11F0$'

    const parsed = parse(x);

    t.equal(parsed.type, 'RESP:GT');
    t.equal(parsed.cmd, 'PNA');
    t.equal(parsed.args.length, 5);
    t.equal(parsed.shorttype, 'RESP');
});


test('parse Buffered GTPNA', function (t) {
    // gv300
    t.plan(4); // Tell tape how many assertions we plan to test.
    // This is needed in case some tests are asynchronous, so tape knows when to be done.
    const x = '+BUFF:GTPNA,060100,135790246811220,,20090214093254,11F0$'

    const parsed = parse(x);

    t.equal(parsed.type, 'BUFF:GT');
    t.equal(parsed.cmd, 'PNA');
    t.equal(parsed.args.length, 5);
    t.equal(parsed.shorttype, 'BUFF');
});


test('parse  +RESP:GTPDP,360100,864251020143040,,,20160318001408,0020$', function (t) {
    // gv500 !
    t.plan(1); // Tell tape how many assertions we plan to test.
    // This is needed in case some tests are asynchronous, so tape knows when to be done.
    const x = '+RESP:GTPDP,360100,864251020143040,,,20160318001408,0020$'
    const parsed = parse(x);
    t.equal(decimalToHex(parsed.count, 4), '0020');
})

test('parse GV500 MPN', function (t) {
    // gv500 !
    t.plan(3); // Tell tape how many assertions we plan to test.
    // This is needed in case some tests are asynchronous, so tape knows when to be done.
    const x = '+BUFF:GTMPN,360100,864251020143040,,,0,,,,,,,0000,0000,0000,0000,00,20160318002638,001E$'
    const parsed = parse(x);
    t.equal(parsed.imei, '864251020143040');
    t.equal(decimalToHex(parsed.count, 4), '001E');
    t.equal(parsed.shorttype, 'BUFF');
})

test('parse GV500 STT', function (t) {
    const x = '+RESP:GTSTT,360100,864251020143040,,,42,0,,,,,,,0310,0260,74AF,AC5A,00,20160318002641,001F$';
    t.plan(2);
    const parsed = parse(x);
    t.equal(decimalToHex(parsed.count, 4), '001F');
    t.equal(parsed.vin, '');

})

test('parse GV500 OPN', function (t) {
    const x = '+RESP:GTOPN,360100,864251020143040,,,0,,,,,,,0310,0260,74AF,AC5A,00,20160318002642,0020$';
    t.plan(2);
    const parsed = parse(x);
    t.equal(decimalToHex(parsed.count, 4), '0020');
    t.equal(parsed.vin, '');
})

test('parse buffered GV500 OPN', function (t) {
    const x = '+BUFF:GTOPN,360100,864251020143040,,,0,,,,,,,0310,0260,74AF,AC5A,00,20160318002642,0020$';
    t.plan(2);
    const parsed = parse(x);
    t.equal(decimalToHex(parsed.count, 4), '0020');
    t.equal(parsed.vin, '');
})

test('parse GV500 RTL', function (t) {
    const x = '+RESP:GTRTL,360100,864251020143040,,,,00,1,1,1.0,0,296.8,-93.296121,44.901623,20160318002705,0310,0260,74AF,AC5A,00,0.0,20160318002706,0021$';
    t.plan(2);
    const parsed = parse(x);
    t.equal(decimalToHex(parsed.count, 4), '0021');
    t.equal(parsed.vin, '');
})

test('parse buffered STT', function (t) {
    const x = '+BUFF:GTSTT,360100,864251020143040,,,42,0,,,,,,,0310,0260,74AF,AC5A,00,20160318002641,001F$';
    t.plan(2);
    const parsed = parse(x);
    t.equal(decimalToHex(parsed.count, 4), '001F');
    t.equal(parsed.vin, '');
})

test('parse PDP', function (t) {
    const x = '+RESP:GTPDP,360100,864251020143040,,,20160318012452,0041$';
    t.plan(2);
    const parsed = parse(x);
    t.equal(decimalToHex(parsed.count, 4), '0041');
    t.equal(parsed.vin, '');
})

test('parse IGL', function (t) {
    const x = '+RESP:GTIGL,360100,864251020143040,,,,00,1,1,0.0,0,270.2,-93.296109,44.901704,20160318013354,0310,0260,74AF,AC5A,00,0.0,20160318013355,004D$';
    t.plan(6);
    const parsed = parse(x);
    t.equal(parsed.imei, '864251020143040');
    t.equal(parsed.longitude, -93.296109);
    t.equal(parsed.latitude, 44.901704);
    t.equal(parsed.altitude, 270.2);
    t.equal(decimalToHex(parsed.count, 4), '004D');
    t.equal(parsed.vin, '');
    // t.equal(parsed.senddate, new Date('Thu Mar 17 2016 20:33:55 GMT-0500 (CDT)'));
})

test('parse OPN', function (t) {
    const x = '+RESP:GTOPN,360100,864251020143040,,,0,,,,,,,0310,0260,74AF,AC5A,00,20160318013256,0045$';
    t.plan(3);
    const parsed = parse(x);
    t.equal(parsed.imei, '864251020143040');
    t.equal(decimalToHex(parsed.count, 4), '0045');
    t.equal(parsed.vin, '');
    // t.equal(parsed.senddate, new Date('Thu Mar 17 2016 20:33:55 GMT-0500 (CDT)'));
})



test('parse CFG', function (t) {
    const x = '+ACK:GTCFG,360100,864251020143040,gv500,0000,20160318041337,005B$';
    t.plan(2);
    const parsed = parse(x);
    t.equal(parsed.imei, '864251020143040');
    t.equal(decimalToHex(parsed.count, 4), '005B');
})

test('parse INF', function (t) {
    const x = '+BUFF:GTINF,360100,864251020143040,,gv500,42,8901260761283398892f,20,0,1,12264,,3.87,0,1,,,20160318041335,,,,,,+0000,0,20160318041337,005C$';
    const parsed = parse(x);
    t.plan(1);
    t.equal(decimalToHex(parsed.count, 4), '005C');

    // todo
})

test('parse GSM', function (t) {
    const x = '+BUFF:GTGSM,360100,864251020143040,,RTL,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0310,0260,74af,ac5a,22,00,20160318042520,006C$';
    const parsed = parse(x);
    t.plan(1);
    t.equal(decimalToHex(parsed.count, 4), '006C');
    // todo
})

test('parse ', function (t) {
    const x = '+ACK:GTFRI,360100,864251020143040,gv500,0000,20160318151632,0161$';
    const parsed = parse(x);
    t.plan(1);
    t.equal(decimalToHex(parsed.count, 4), '0161');
    // todo
})

test('parse buffered FRI', function (t) {
    const x = '+BUFF:GTFRI,250506,863286020988292,,,10,1,0,0.0,27,,30.543643,50.422092,20160317205427,,,,,,16138.4,01265:18:43,,,9,110000,,,,20160318044421,AB27$';
    const parsed = parse(x);
    t.plan(18);
    t.equal(decimalToHex(parsed.count, 4), 'AB27');
    t.equal(parsed.imei, '863286020988292');
    t.equal(parsed.senddate.toISOString(), '2016-03-18T04:44:21.000Z');
    t.equal(parsed.gpsdate.toISOString(), '2016-03-17T20:54:27.000Z');
    t.equal(parsed.version, '250506');
    t.equal(parsed.rid, '1');
    t.equal(parsed.rty, '0');
    t.equal(parsed.number, '1');
    t.equal(parsed.accuracy, 0);
    t.equal(parsed.speed, 0);
    t.equal(parsed.azimuth, 27);
    t.equal(_.isNaN(parsed.altitude), true);
    t.equal(decimalToHex(parsed.count, 4), 'AB27');
    t.equal(parsed.hourmeter, '01265:18:43');
    t.equal(parsed.batteryPercent, 9);
    t.equal(parsed.status, '110000');
    t.equal(parsed.friendlyStatus, 'ignition off rest');
    t.equal(parsed.mileage, 16138.4);
})

test('parse heartbeat ack', function (t) {
    const x = '+ACK:GTHBD,360100,864251020143040,gv500,20160319023819,0172$';
    const parsed = parse(x);
    t.plan(4);
    t.equal(decimalToHex(parsed.count, 4), '0172');
    t.equal(parsed.imei, '864251020143040');
    t.equal(parsed.name, 'gv500');
    t.equal(parsed.vin, undefined);
})

test('parse BSI ack', function (t) {
    const x = '+ACK:GTBSI,360100,864251020143040,gv500,0000,20160319172911,018C$';
    const parsed = parse(x);
    t.plan(2);
    t.equal(decimalToHex(parsed.count, 4), '018C');
    t.equal(parsed.imei, '864251020143040')
})

test('parse TOW ack gv500', function (t) {
    const x = '+ACK:GTTOW,360100,864251020143040,gv500,0000,20160320035131,01BE$';
    const parsed = parse(x);
    t.plan(2);
    t.equal(decimalToHex(parsed.count, 4), '01BE');
    t.equal(parsed.imei, '864251020143040')
})

test('parse VER', function (t) {
    const x = '+RESP:GTVER,360201,864251020143727,,gv500,GV500,0209,0101,20160329161513,061B$';
    const parsed = parse(x);
    t.plan(2);
    t.equal(decimalToHex(parsed.count, 4), '061B');
    t.equal(parsed.imei, '864251020143727')
})

test('parse RTO', function (t) {
    const x = '+ACK:GTRTO,360201,864251020143727,gv500,VER,FFFF,20160329161513,061A$';
    const parsed = parse(x);
    t.plan(2);
    t.equal(decimalToHex(parsed.count, 4), '061A');
    t.equal(parsed.imei, '864251020143727')
})

test('TOW config', function (t) {
    const x = '+ACK:GTTOW,360303,864251020143636,gv500,FFFF,20160707194905,00B2$';
    const parsed = parse(x);
    t.plan(3);
    t.equal(decimalToHex(parsed.count, 4), '00B2');
    t.equal(parsed.imei, '864251020143636')
    t.equal(parsed.shorttype, 'ACK')
})

test('DTT message', function (t) {
    const x = '+RESP:GTDTT,250403,863286020190428,,,,0,8,1235UUU,0,0.0,55,,37.534451,48.632817,20160828135149,,,,,,,,,,20160828143537,006A$';
    const parsed = parse(x);
    t.plan(3);
    t.equal(decimalToHex(parsed.count, 4), '006A');
    t.equal(parsed.imei, '863286020190428')
    t.equal(parsed.shorttype, 'RESP')
})
