/* Copyright (c) 2016 Grant Miner */
"use strict";
const Promise = require("bluebird");
const r = require("./db");
Promise.coroutine(function*() {
  let vehicle = (yield r.table("vehicles").filter({
    device: "asdf"
  }))[0];

  debugger;
})();
