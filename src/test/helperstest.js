/* Copyright (c) 2016 Grant Miner */
'use strict';
import test from 'tape';
import {isMotion} from '../common/helpers';

test('towing is not considered motion', function(t) {
	t.plan(1);

	t.equal(isMotion({
		"buffered": false,
		"type": "RESP:GT",
		"cmd": "TOW",
		"friendly": "Towing",
		"version": "250404",
		"imei": "863286020049095",
		"name": "",
		"rid": "0",
		"rty": "0",
		"number": "1",
		"accuracy": 1,
		"speed": 0.2,
		"azimuth": 85,
		"altitude": null,
		"gpsdate": "2015-12-27T00:22:25.000Z",
		"mcc": "",
		"mnc": "",
		"lac": "",
		"cellid": "",
		"mileage": 1605.6,
		"senddate": "2015-12-27T00:22:25.000Z",
		"count": 8885
	}), false);
});


test('harsh behavior is motion', function(t) {
	t.plan(1);

	t.equal(isMotion({
		"buffered": false,
		"type": "RESP:GT",
		"cmd": "HBM",
		"friendly": "Harsh acceleration or braking",
		"version": "250404",
		"imei": "863286020049095",
		"name": "",
		"rid": "1",
		"rty": "1",
		"number": "1",
		"accuracy": 1,
		"speed": 41.1,
		"azimuth": 185,
		"altitude": null,
		"gpsdate": "2015-12-26T18:44:21.000Z",
		"mcc": "",
		"mnc": "",
		"lac": "",
		"cellid": "",
		"mileage": 1601,
		"senddate": "2015-12-26T18:44:21.000Z",
		"count": 8850
	}), true);
})

test('ignition on is not motion', function(t) {
	t.plan(1);

	t.equal(isMotion({
		"buffered": false,
		"type": "RESP:GT",
		"cmd": "IGN",
		"friendly": "Ignition on",
		"version": "250404",
		"imei": "863286020049095",
		"name": "",
		"ignitionDuration": 3271,
		"accuracy": 0,
		"speed": 0,
		"azimuth": 83,
		"altitude": null,
		"gpsdate": "2015-12-26T17:21:09.000Z",
		"mcc": "",
		"mnc": "",
		"lac": "",
		"cellid": "",
		"hourmeter": "00037:35:34",
		"mileage": 1600.4,
		"senddate": "2015-12-26T18:15:38.000Z",
		"count": 8841
	}), false);
})


test('ignition off rest is not motion', function(t) {
	t.plan(1);

	t.equal(isMotion({
		"buffered": true,
		"type": "BUFF:GT",
		"cmd": "FRI",
		"friendly": "Fixed report",
		"version": "250404",
		"imei": "863286020049095",
		"name": "",
		"powervcc": "",
		"rid": "1",
		"rty": "0",
		"number": "1",
		"accuracy": 1,
		"speed": 0,
		"azimuth": 83,
		"altitude": null,
		"longitude": -93,
		"latitude": 44,
		"gpsdate": "2015-12-26T16:53:05.000Z",
		"mcc": "",
		"mnc": "",
		"lac": "",
		"cellid": "",
		"mileage": 1600.4,
		"hourmeter": "00037:35:14",
		"ain1": "",
		"ain2": "",
		"batteryPercent": 48,
		"status": "110000",
		"senddate": "2015-12-26T16:56:16.000Z",
		"count": 8820,
		"friendlyStatus": "ignition off rest"
	}), false);
})


test('idling is not motion', function(t) {
	t.plan(1);

	t.equal(isMotion({
	    "buffered": false,
	    "type": "RESP:GT",
	    "cmd": "FRI",
	    "friendly": "Fixed report",
	    "version": "250404",
	    "imei": "863286020049095",
	    "name": "",
	    "powervcc": "",
	    "rid": "1",
	    "rty": "0",
	    "number": "1",
	    "accuracy": 1,
	    "speed": 0,
	    "azimuth": 188,
	    "altitude": null,
	    "longitude": -93,
	    "latitude": 44,
	    "gpsdate": "2015-12-26T18:49:57.000Z",
	    "mcc": "",
	    "mnc": "",
	    "lac": "",
	    "cellid": "",
	    "mileage": 1603.1,
	    "hourmeter": "00037:45:44",
	    "ain1": "",
	    "ain2": "",
	    "batteryPercent": 99,
	    "status": "220100",
	    "senddate": "2015-12-26T18:50:00.000Z",
	    "count": 8854,
	    "friendlyStatus": "ignition on motion"
	}), false);
})
