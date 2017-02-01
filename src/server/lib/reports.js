/* Copyright (c) 2016 Grant Miner */
'use strict';
import Promise from 'bluebird';
import _ from 'lodash';
import r from '../../common/db';
import {get} from 'lodash';
import bunyan from 'bunyan';
import moment from 'moment';
import helpers from '../../common/helpers';
import {isIdle, isPark, isStop, isTow} from '../../common/status';
import addressdisplay from'../../common/addressdisplay';

import idleReport from './reports/idle';
import dailyReport from './reports/daily';
import mileageReport from './reports/mileage';
import odometerReport from './reports/odometer';
import startReport from './reports/start';
import ignitionReport from './reports/ignition';
import speedReport from './reports/speed';
import summaryReport from './reports/summary';
import obdReport from './reports/obd';
import jesReport from './reports/jes';

const log = bunyan.createLogger({
	name: 'reports',
	level: 'debug'
});

function ignoreCaseEquals(a, b) {
	return new RegExp("^" + a + "$", "i").test(b);
}
module.exports.getReport = async function(orgid, reportid, vehicles, startDate, endDate, tzOffset) {
	startDate = new Date(startDate);
	endDate = new Date(endDate);

	log.debug('Report Start: ' + moment(startDate).utc().format());
	log.debug('Report End: ' + moment(endDate).utc().format());

	const result = {
		query: {
			orgid: orgid,
			reportid: reportid,
			startDate: startDate,
			endDate: endDate,
			tzOffset: tzOffset,
			vehicles: vehicles
		},
		vehicles: {},
		results: {},
		totals: {}
	}

	await Promise.map(vehicles, async function (vid) {
		const vehicle = await r.table('vehicles').get(vid);
		if (vehicle.orgid !== orgid) {
			// security check each vehicle so end user can't insert any vehicle ID into the request
			throw new Error(vid + ' does not exist or you do not have access to it')
		}
		result.vehicles[vid] = vehicle;
	}, {
		concurrency: 1
	});

	await Promise.map(vehicles, async function (vid) {
		const history = await r.table('vehiclehistory').between(startDate, endDate, {
				index: 'd',
				leftBound: 'closed',
				rightBound: 'open'
			})
			.filter({
				'vid': vid
			})
			.orderBy('id');

		switch (reportid) {
			case 'idle':
				const reportResults = idleReport(history);
				result.results[vid] = reportResults.results;
				result.totals[vid] = reportResults.totals;
				break;

			case 'daily':

				result.results[vid] = dailyReport(history, tzOffset);
				break;

			case 'mileage':
				result.results[vid] = mileageReport(history, result.totals);
				break;

			case 'odometer':
				result.results[vid] = odometerReport(history);
				break;

			case 'start':
				result.results[vid] = startReport(history);
				break;

			case 'ignition':
				result.results[vid] = ignitionReport(history);
				break;

			case 'speed':
				const threshold = 112.654; // 70 mph
				result.results[vid] = speedReport(history, threshold);
				result.totals[vid] = _.max(_.map(history, function(item) {
					return item.s;
				}));
				break;

			case 'summary':
				result.results[vid] = Object.assign(summaryReport(history), {
					name: vid
				});
				break;

			case 'obd':
				result.results[vid] = obdReport(history);
				break;

			case 'jes':
				result.results[vid] = jesReport(history);
				break;

			default:
				throw new Error('Unknown report type ' + reportid);
		}
	}, {
		concurrency: 1
	});

	return result;
}
