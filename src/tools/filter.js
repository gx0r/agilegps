/* Copyright (c) 2016 Grant Miner */

// Load event data from a file and filter by IMEI
// Usage: node filter.js filename imei
"use strict";

const Promise = require("bluebird");
const fs = Promise.promisifyAll(require("fs"));
const _ = require("lodash");
const parse = require("../helper/eventreportparser");

if (process.argv[2]) {
  const filename = process.argv[2];
} else {
  console.error("Need a filename");
  process.exit(1);
}

if (process.argv[3]) {
  const imei = process.argv[3];
} else {
  console.error("Need an IMEI");
  process.exit(1);
}

fs.readFileAsync(filename).then(function(data) {
  messages = data.toString().split(/\r?\n|\r/);
  messages.map(function(message) {
    try {
      message = message.toString().trim();

      const parsed = parse(message);

      if (parsed.imei === imei) {
        console.log(message);
      }
    } catch (e) {
      console.error("Bad message: " + message);
      console.error(e.stack);
    }
  });
});
