/* Copyright (c) 2016 Grant Miner */
'use strict';
import {get} from 'lodash';
import bunyan from 'bunyan';
import moment from 'moment';
import {cleanData, mileageChange} from '../../../common/helpers';
import {getStatus} from '../../../common/status';

const log = bunyan.createLogger({
	name: 'reports',
	// level: 'debug'
});

export default (history, tzOffset) => {
	let currentDay, firstIgnOn, lastIgnOff, beginOdometer, endOdometer;
	function resetDay() {
		currentDay = null;
		firstIgnOn = null;
		lastIgnOff = null;
		beginOdometer = NaN;
		endOdometer = NaN;
	}

	resetDay();

	return mileageChange(cleanData(history)).reduce((previousValue, currentValue, currentIndex, array) => {
		function checkValue() {
			let st = getStatus(currentValue);
			if (currentDay == null) {
				if (st === 'Ign on') {
					currentDay = moment(new Date(currentValue.d)).startOf('day');
					currentDay = currentDay.add(tzOffset, 'minutes');
					log.debug('Current day: ' + currentDay.utc().format())
					beginOdometer = currentValue.m;
					firstIgnOn = new Date(currentValue.d);
					log.debug('First on: ' + moment(firstIgnOn).utc().format());
				}
			}
		}
		checkValue();

		let isWithinTheDay = currentDay != null && moment(new Date(currentValue.d)).isBefore(moment(currentDay).add('1', 'days'));

		if (getStatus(currentValue) === 'Ign off' && isWithinTheDay) {
			lastIgnOff = new Date(currentValue.d);
			endOdometer = currentValue.m;
		}

		if (currentDay != null && (!isWithinTheDay || currentIndex === array.length - 1)) {
			log.debug('Last off: ' + moment(lastIgnOff).utc().format());

			previousValue.push({
				d: currentDay.toISOString(),
				firstIgnOn: firstIgnOn,
				lastIgnOff: lastIgnOff,
				duration: moment(lastIgnOff).diff(firstIgnOn) / 1000,
				beginOdometer: beginOdometer,
				endOdometer: endOdometer,
				distance: endOdometer - beginOdometer
			})
			resetDay();
			checkValue();
		}

		return previousValue;
	}, [])
};
