/* Copyright (c) 2016 Grant Miner */
"use strict";
const Promise = require("bluebird");
const bcrypt = require("bcryptjs");
Promise.promisifyAll(bcrypt);
const rounds = 10;
const hashmatch = /^\$2[ayb]\$.{56}$/;

module.exports.isHashed = function isHashed(str) {
  return hashmatch.test(str);
};

module.exports.hash = async function hash(password) {
  const salt = await bcrypt.genSaltAsync(rounds);
  const hash = await bcrypt.hashAsync(password, salt);
  return hash;
};
