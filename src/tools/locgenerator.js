/* Copyright (c) 2016 Grant Miner */

// Location fake generator
// e.g.,  node locgenerator.js 861074021378065 2000
// Usage: node locgenerator.js imei interval

"use strict";

const Promise = require("bluebird");
const co = Promise.coroutine;
const fs = Promise.promisifyAll(require("fs"));
const _ = require("lodash");
const dgram = Promise.promisifyAll(require("dgram"));
const moment = require("moment");
const config = require("../../config/faker.js");
const lucidlocation = require("lucidlocation");
const decimalToHex = require("../listen/decimaltohex");

let imei;
if (process.argv[2]) {
  imei = process.argv[2];
} else {
  console.error("Need a imei");
  process.exit(1);
}

let delay;
if (process.argv[3]) {
  delay = parseInt(process.argv[3], 10);
} else {
  delay = 5000;
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

(async function() {
  let count = -1;
  while (true) {
    count++;
    if (count > 65535) {
      count = 0;
    }
    let d = moment.utc().format("YYYYMMDDHHmmss");
    console.log(d);
    let azimuth = getRandomIntInclusive(0, 360);
    let speed = getRandomIntInclusive(0, 100);
    let gpsAccuracy = getRandomIntInclusive(0, 20);
    let powervcc = 14055;
    let randomLocation = lucidlocation.getRandomLocation();
    // let longitude = -82.972203;
    let longitude = randomLocation.longitude;
    // let latitude = 41.372237;
    let latitude = randomLocation.latitude;
    let batteryPercent = getRandomIntInclusive(0, 100);
    let status = "220100";
    let countH = decimalToHex(count, 4);

    let message = `+RESP:GTFRI,060502,${imei},,${powervcc},10,1,${gpsAccuracy},${speed},${azimuth},,${longitude},${latitude},${d},,,,,,0,FAKE:00:00,,,${batteryPercent},${status},,,,${d},${countH}$`;
    console.log(message);

    await socket.sendAsync(message, 0, message.length, port, host);
    if (delay != 0) {
      await Promise.delay(delay);
    }
  }
})();
