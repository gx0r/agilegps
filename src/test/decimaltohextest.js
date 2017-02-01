/* Copyright (c) 2016 Grant Miner */
'use strict';
import test from 'tape';
import decimalToHex from '../listen/decimaltohex';

test('test', function (t) {
    t.plan(1);

    const hex = decimalToHex(108);
    t.equal(hex, '6C');
})
