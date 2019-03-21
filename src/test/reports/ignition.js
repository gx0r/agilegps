/* Copyright (c) 2016 Grant Miner */
'use strict';
const test = require('tape');
const _ = require('lodash');
const ignition = require('../../server/lib/reports/ignition');

test('ignition report', function (t) {
	t.plan(1);

	const history = require('./apr3.json');
	const result = ignition(history);
	t.equal(result[0].cmd, 'IGF', 'ignition off command');
})
