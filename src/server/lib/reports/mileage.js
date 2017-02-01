/* Copyright (c) 2016 Grant Miner */
'use strict';
import {isFinite} from 'lodash';
import {get} from 'lodash';
import bunyan from 'bunyan';
import Promise from 'bluebird';
import moment from 'moment';
import {cleanData, mileageChange} from '../../../common/helpers';
import {state as displayState} from '../../../common/addressdisplay';

const log = bunyan.createLogger({
	name: 'reports',
	// level: 'debug'
});

export default (history, totals) => {
	history = history.filter(item => item.la != null && item.lo != null);

	history = cleanData(history);
	history = mileageChange(history);

	let mileageByState = Object.create(null);

	history.forEach(function(item) {
		if (isFinite(item.mc) && item.mc > 0) {
			let state = displayState(item) || 'Unknown';

			if (mileageByState[state] == null) {
				mileageByState[state] = 0;
			}
			if (totals[state] == null) {
				totals[state] = 0;
			}

			mileageByState[state] += item.mc;
			totals[state] += item.mc;
		}
	})

	return mileageByState;
}
