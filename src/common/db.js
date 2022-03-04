/* Copyright (c) 2016 Grant Miner */
"use strict";
const options = require("../../config/database.js");
const r = (module.exports = require("rethinkdbdash")(options));
require("./handleUncaught")(r, {
  filter: function(errorOrException) {
    if (errorOrException.msg === "Malicious Path") {
      return false;
    }
    return true;
  }
});
