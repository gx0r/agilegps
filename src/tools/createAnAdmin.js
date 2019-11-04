/* Copyright (c) 2016 Grant Miner */

// Create or update an admin user wih username and password.
// Usage: node createAnAdmin.js username password [rounds]
// Rounds is number of bcrypt hash rounds to perform, e.g. 10.

"use strict";
const Promise = require("bluebird");
const bcrypt = Promise.promisifyAll(require("bcryptjs"));
const r = require("../common/db");
Promise.coroutine(function*() {
  let rounds = 10;
  if (process.argv[4]) {
    rounds = parseInt(process.argv[4]);
  }
  let salt = yield bcrypt.genSaltAsync(rounds);
  let hashedPassword = yield bcrypt.hashAsync(process.argv[3], salt);

  let username = process.argv[2];

  let existingUser = yield r.table("users").get(username);

  let newUser = {
    username: process.argv[2],
    password: hashedPassword,
    isAdmin: true,
    orgid: "default",

    type: "",
    email: "",
    firstname: "",
    lastname: "",
    workphone: "",
    mobilephone: "",
    fax: "",
    timezone: "",
    isOrgAdmin: false
  };

  let toInsert = Object.assign({}, existingUser, newUser);

  if (existingUser == null) {
    yield r.table("users").insert(toInsert);
  } else {
    yield r.table("users").update(toInsert);
  }

  r.getPoolMaster().drain(); // drain pool to allow process to exit.
})();
