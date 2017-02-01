/* Copyright (c) 2016 Grant Miner */
'use strict';
import Promise from 'bluebird';
import bcrypt from 'bcrypt';
Promise.promisifyAll(bcrypt);
const rounds = 10;
const hashmatch = /^\$2[ayb]\$.{56}$/

export function isHashed(str) {
    return hashmatch.test(str);
}

export async function hash (password) {
    const salt = await bcrypt.genSaltAsync(rounds);
    const hash = await bcrypt.hashAsync(password, salt);
    return hash;
}
