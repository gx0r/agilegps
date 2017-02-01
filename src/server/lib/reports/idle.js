/* Copyright (c) 2016 Grant Miner */
'use strict';
import _ from 'lodash';
import {get} from 'lodash';
import bunyan from 'bunyan';
import Promise from 'bluebird';
import moment from 'moment';
import {cleanData, rollup} from '../../../common/helpers';
import {isIdle} from '../../../common/status';

const log = bunyan.createLogger({
	name: 'reports',
	level: 'debug'
});

export default (history) => {
	let result = Object.create(null);
	history = cleanData(history);
	history = history.filter(item => item.cmd === 'FRI' || item.cmd === 'IGN' || item.cmd === 'IGF');
	history = rollup(history);
	history = history.filter(isIdle)

	result.results = history;
	result.totals = history.reduce(function(prev, curr) {
		return prev + curr.idleTime;
	}, 0);

	return result;
}
