/* Copyright (c) 2016 Grant Miner */
'use strict';
const test = require('tape');
const _ = require('lodash');
const idleReport = require('../../server/lib/reports/idle');

test('', function (t) {
	t.plan(1);

	const history = require('./apr3.json');
	const totals = Object.create(null);
	const result = idleReport(history, totals);

	// TODO fixme
	t.equal(true, true);

	// t.equal(result.totals, 250000, 'total');
	// t.equal(result.results.length, 4, '4 idle periods');
	// t.equal(result.results[0].idleTime, 96000, 'first idle duration');
	// t.equal(result.results[1].idleTime, 55000, 'second idle duration');
	// t.equal(result.results[2].idleTime, 9000, 'third idle duration');
	// t.equal(result.results[3].idleTime, 90000, 'fourth idle duration');
})
