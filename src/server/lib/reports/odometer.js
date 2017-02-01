/* Copyright (c) 2016 Grant Miner */
'use strict';
import {isFinite} from 'lodash';
import {get} from 'lodash';
import bunyan from 'bunyan';
import Promise from 'bluebird';
import moment from 'moment';
import {cleanData, mileageChange, ignitionMileage} from '../../../common/helpers';
import {getStatus, isIdle, isPark, isStop, isStart, isTow} from '../../../common/status';
import {state as displayState} from '../../../common/addressdisplay';

const log = bunyan.createLogger({
	name: 'reports',
	// level: 'debug'
});

export default (history) => {
	history = history.filter(function (item) {
		return item.la != null && item.lo != null
	})

	history = cleanData(history);
	history = mileageChange(history);
	history = ignitionMileage(history);

	let odometerStart, odometerEnd;
	let mileageByState = [];
	let currentState = null;
	let firstState = true;

	history.reduce(function(prev, curr, idx, array) {
		if (isFinite(curr.m) && curr.m > 0) {
			let state = displayState(curr) || 'Unknown';

			if (state != null && firstState) {
				currentState = state;
				odometerStart = curr.m;
				odometerEnd = curr.m;
				firstState = false;
			} else if (state != null && state != currentState || idx === array.length - 1) { // hit a new state or the end
				odometerEnd = curr.m;
				mileageByState.push({
					state: currentState,
					odometerStart: odometerStart,
					odometerEnd: odometerEnd
				})

				currentState = state;
				odometerStart = curr.m;
				odometerEnd = curr.m;

			} else {
				if (state != null) {
					odometerEnd = curr.m;
				}
			}
		}

	}, [])

	return mileageByState;
}
