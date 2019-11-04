/* Copyright (c) 2016 Grant Miner */

// Load event data from a file and send as if it came from GPS units.
// Usage: node faker.js filename
// file will be messages separated by newlines.
"use strict";

const Promise = require("bluebird");
const fs = Promise.promisifyAll(require("fs"));
const _ = require("lodash");
const dgram = Promise.promisifyAll(require("dgram"));

const config = require("../../config/faker.js");
const delay = config.delay;

let filename;
if (process.argv[2]) {
  filename = process.argv[2];
} else {
  console.error("Need a filename");
  process.exit(1);
}

let maxSend;
if (process.argv[3]) {
  maxSend = parseInt(process.argv[3], 10);
} else {
  maxSend = Infinity;
}

const port = config.port;
const host = config.host;

const socket = dgram.createSocket("udp4");

socket.on("message", function(msg, rinfo) {
  console.log("Received %s from %s:%d", msg, rinfo.address, rinfo.port);
});

// Returns a random integer between min (included) and max (included)
// Using Math.round() will give you a non-uniform distribution!
function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

Promise.coroutine(function*() {
  const data = yield fs.readFileAsync(filename);
  messages = data.toString().split(/\r?\n|\r/);
  let i = -1;

  while (i < messages.length && i < maxSend) {
    i++;

    if (!messages[i]) {
      console.log("Message " + i + " was null");
      continue; // handle null messages
    } else {
      // console.log(i);
    }

    let message = new Buffer(messages[i]);
    // console.log(message.toString());
    if (delay != 0) {
      yield Promise.delay(delay);
    }
    yield socket.sendAsync(message, 0, message.length, port, host);

    if (i === maxSend) {
      console.log("Hit max send of " + maxSend);
    } else if (i === messages.length - 1) {
      console.log("Sent all " + messages.length + " messages");
    }
  }
})();
