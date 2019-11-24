/* Copyright (c) 2016 Grant Miner */

// Mega Fleet Generator 
// Usage: node locgenerator.js interval

"use strict";
const Promise = require("bluebird");
const dgram = Promise.promisifyAll(require("dgram"));
const moment = require("moment");
const config = require("../../config/faker.js");
const lucidlocation = require("lucidlocation");
const decimalToHex = require("../listen/decimaltohex");

let delay;
if (process.argv[2]) {
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

function getRandomNegative() {
  return getRandomIntInclusive(0, 3) === 0 ? 1 : -1;
}

let lat = 44.952833;
let long = -93.091971;
let mileage = 1;

const IMEI = [];

for (let imei = 1; imei <= 14; imei++) {
  IMEI.push(imei);
}

IMEI.forEach(startHistory);

async function startHistory(imei) {
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
    let longitude = long += Math.random() * getRandomNegative() / (1000 / imei);
    let latitude = lat += Math.random() * getRandomNegative() / (1000 / imei);
    let batteryPercent = getRandomIntInclusive(80, 100);
    let status = "220100";
    let countH = decimalToHex(count, 4);

    mileage += 1;

    let message = `+RESP:GTFRI,060502,${imei},,${powervcc},10,1,${gpsAccuracy},${speed},${azimuth},,${longitude},${latitude},${d},,,,,,${mileage},FAKE:00:00,,,${batteryPercent},${status},,,,${d},${countH}$`;
    console.log(message);

    await socket.sendAsync(message, 0, message.length, port, host);
    if (delay != 0) {
      await Promise.delay(delay);
    }
  }
};
