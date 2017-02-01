/* Copyright (c) 2016 Grant Miner */
'use strict';
import _ from 'lodash';
import {get} from 'lodash';
import bunyan from 'bunyan';
import Promise from 'bluebird';
import moment from 'moment';

import {cleanData, ignitionMileage, mileageChange} from '../../../common/helpers';

import {getStatus, isIdle, isPark, isStop, isStart, isTow} from '../../../common/status';
import addressdisplay from'../../../common/addressdisplay';

const log = bunyan.createLogger({
	name: 'reports',
	// level: 'debug'
});

export default (history) => {
	history = cleanData(history);
	history = mileageChange(history);
	history = ignitionMileage(history);

	history = history.filter(function(item) {
		return item.cmd === 'FRI' || item.cmd === 'IGN' || item.cmd === 'IGF';
	})

	let startTime = null;
	let mileageStart = NaN;
	let idleDuration = 0;
	let parkedStart = null;
	let lastStop = null;

	history = history.reduce(function(output, current) {
		let last = output[output.length - 1];
		if (current.cmd === 'IGN') {
			startTime = current.d;
			mileageStart = current.m;
			idleDuration = 0;
			lastStop = null;
		}

		if (isIdle(current) && last != null && current.d != null && startTime != null) {
			idleDuration += moment(current.d).diff(last.d) / 1000
		}

		if (startTime != null && current.cmd === 'IGF') {
			current.startTime = startTime;
			current.startStopMileage = current.m - mileageStart;
			current.transitTime = moment(current.d).diff(current.startTime) / 1000;
			current.idleDuration = idleDuration;
			lastStop = current;
		} else if (current.cmd === 'IGF') {
			current.startTime = null;
			current.startStopMileage = 0;
			current.idleDuration = 0;
			startTime = null;
			mileageStart = current.m;
			idleDuration = 0;
			lastStop = current;
		}

		if (lastStop != null && isPark(current)) {
			if (!lastStop.parkedStart) {
				lastStop.parkedStart = current.d;
			}
			lastStop.ad = current.ad;
			lastStop.parkedEnd = current.d;
			lastStop.parkedDuration = moment(lastStop.parkedEnd).diff(lastStop.parkedStart) / 1000;
		}

		output.push(current);

		return output;
	}, [])

	return history.filter(item => item.cmd === 'IGF');
}
