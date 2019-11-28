/* Copyright (c) 2016 Grant Miner */
"use strict";
const Promise = require("bluebird");
Promise.longStackTraces();
const reversegeo = require("../helper/reversegeo");
const bunyan = require("bunyan");
const moment = require("moment");
const r = require("../common/db");
const isNaN = require("lodash").isNaN;
const isFinite = require("lodash").isFinite;
const port = require("../../config/listener.js").port;
const host = require("../../config/listener.js").host;
const sack = require("../../config/listener.js").sack;
const relayTo = require("../../config/listener.js").relayTo || [];
const geocode = require("../../config/listener.js").geocode;
const insertrawevents = require("../../config/listener.js").insertrawevents;
const isNotVerbose = require("../common/helpers").isNotVerbose;
const os = require("os");
const dgram = require("dgram");
const parse = require("../helper/eventreportparser");
const fetch = require("node-fetch");
const Status = require("../common/status");
const querystring = require("querystring");
const LRU = require("lru-cache");
const decimalToHex = require("./decimaltohex");
const verror = require("verror");

process.name = 'agilegps-listener';

async function logError(err) {
  await r.table('errors').insert({
    host: os.hostname(),
    pid: process.pid,
    date: new Date(),
    stack: err.stack,
    argv: process.argv,
    cwd: process.cwd(),
    memory: process.memoryUsage(),
    uptime: process.uptime(),
    promise: false,
    uid: process.getuid(),
    groups: process.getgroups(),
    load: os.loadavg()
  });
};

const socket = dgram.createSocket("udp4");
const vehicleCache = new LRU();
const log = bunyan.createLogger({
  name: "listen",
  level: require("../../config/listener.js").loglevel || 'info'
});

let inserts = 0;
let cachehit = 0;
let concurrent = 0;
let outstandingInserts = {};

(async function() {
  let cursor = await r
    .table("vehicles")
    .pluck(["id", "device"])
    .changes({ includeInitial: true })
    .run();
  cursor.each(function(nothing, changes) {
    if (changes) {
      log.trace(changes);
      let oldVal = changes.old_val;
      let newVal = changes.new_val;

      if (oldVal != null && oldVal.device != null) {
        vehicleCache.del(oldVal.device);
      }
      if (newVal != null) {
        if (oldVal == null && newVal.device != null) {
          vehicleCache.set(newVal.device, newVal);
        } else if (newVal.device != null) {
          vehicleCache.set(newVal.device, newVal);
        } else {
          const msg = `No IMEI for vehicle ${newVal.name} ${newVal.id}`;
          // logError(new Error(msg));
          log.trace(msg);
        }
      }
    }
    log.debug(`${vehicleCache.itemCount} vehicles cached`);
  });

  // log.debug("Warming up the reverse geocoder...");
  // await reversegeo(45, 45); // Warm up the reverse geocoder
  socket.bind(port, host);

  if (process.setegid && process.getuid() === 0) {
    // if we are root
    // we have opened the sockets, now drop our root privileges
    process.setgid("nobody");
    process.setuid("nobody");
    // Newer node versions allow you to set the effective uid/gid
    if (process.setegid) {
      process.setegid("nobody");
      process.seteuid("nobody");
    }
  }
})();

const relaySocket = dgram.createSocket("udp4");
function maybeRelayMessage(msg) {
  relayTo.forEach(relayInfo => {
    log.trace("Relaying to: " + relayInfo.host + ":" + relayInfo.port);
    relaySocket.send(msg, 0, msg.length, relayInfo.port, relayInfo.host);
  });
}

function sendSack(parsed, remote) {
  let msg;
  if (parsed.cmd === "HBD") {
    msg = "+SACK:GTHBD" + ",," + decimalToHex(parsed.count, 4) + "$";
  } else {
    msg = "+SACK:" + decimalToHex(parsed.count, 4) + "$";
  }
  msg = msg.toUpperCase();
  socket.send(msg, 0, msg.length, remote.port, remote.address);
}

function deleteNonFiniteValues(obj) {
  Object.keys(obj).forEach(function(key) {
    // delete NaNs/Infinity as RethinkDB will reject them
    if (isNaN(obj[key])) {
      delete obj[key];
    }
    if (Infinity == obj[key] || -Infinity == obj[key]) {
      delete obj[key];
    }
  });
}

socket.on("listening", function() {
  let address = socket.address();
  log.info(`UDP server listening on ${address.address}:${address.port}`);
});

socket.on("message", async function(message, remote) {
  // await lastMessageProcess;
  // log.info(remote.address + ':' + remote.port +' - ' + message);
  // await Promise.all(outstandingInserts); // wait for all prior inserts to occur
  let parsed;

  try {
    parsed = parse(message);
  } catch (err) {
    const msg = `Error parsing from: ${remote.address}:${remote.port}, message: ${message}`;
    log.warn(msg);
    const wrapped = new verror.WError(err, msg);
    logError(wrapped);
    throw wrapped;
  }

  log.trace(parsed);
  maybeRelayMessage(message);

  if (insertrawevents) {
    let raw = r
      .table("rawevents")
      .insert({
        host: os.hostname(),
        remotehost: remote.address,
        port: remote.port,
        message: message.toString(),
        imei: parsed.imei,
        date: parsed.senddate,
        serverDate: new Date()
      })
      .run();
  }

  // ignore FRI towing events and faketow events
  if (
    false
    // parsed.friendlyStatus === 'fake tow'
    // || parsed.friendlyStatus === 'ignition off motion'
  ) {
    if (sack) {
      sendSack(parsed, remote);
    }
    return;
  }

  const deviceUpdate = Object.create(null);
  let isDeviceUpdateOnly = false;
  if (isFinite(parsed.batteryPercent)) {
    deviceUpdate.batteryPercent = parsed.batteryPercent;
  }

  // Device config type messages
  if (parsed.cmd === "HBD") {
    deviceUpdate.lastHeartbeat = new Date();
    isDeviceUpdateOnly = true;
  } else if (
    parsed.shorttype === "ACK" ||
    ["PDP", "INF", "CFG", "GSM", "VER", "ALL"].indexOf(parsed.cmd) > -1
  ) {
    if (parsed.shorttype === "ACK") {
      deviceUpdate["lastACK" + parsed.cmd] = parsed.senddate;
    } else {
      deviceUpdate["last" + parsed.cmd] = parsed;
    }
    isDeviceUpdateOnly = true;
  }

  log.debug({
    imei: parsed.imei,
    deviceUpdate: deviceUpdate,
  });

  await r
    .table("devices")
    .get(parsed.imei)
    .update(deviceUpdate)
    .run();

  if (isDeviceUpdateOnly) {
    if (sack) {
      sendSack(parsed, remote);
    }
    return;
  }

  // r.db('agilegps').table('events').orderBy({index: r.desc('order')})
  // let result = await r.table('events').insert({  // processed events
  //     host: remote.address,
  //     port: remote.port,
  //     message: message.toString(),
  //     date: parsed.senddate,
  //     friendly: parsed.friendly,
  //     parsed: parsed,
  //     count: parsed.count
  // });

  // find if associated vehicle and insert vehicle events.
  const vehicle = vehicleCache.get(parsed.imei);

  if (vehicle == null) {
    const err = new Error(`Null or undefined vehicle for IMEI ${parsed.imei}`);
    logError(err);
    throw err;
  }

  let toInsert = Object.create(null);

  toInsert.a = parsed.azimuth;
  toInsert.b = parsed.shorttype === "BUFF";
  toInsert.bp = parsed.batteryPercent;
  // toInsert.c = parsed.count;
  toInsert.cmd = parsed.cmd;
  toInsert.d = parsed.senddate;
  toInsert.g = parsed.accuracy;
  // GPS signal status update only
  toInsert.gss = parsed.gpsSignalStatus === "1" ? true : undefined;
  toInsert.h = parsed.hourmeter;

  // http://momentjs.com/docs/#/parsing/string-format/
  let id =
    moment.utc(parsed.senddate).format("YYYYMMDDHHmmssSSS") +
    "|" +
    parsed.imei +
    "|" +
    decimalToHex(parsed.count + "", 4); // more space efficient ID but with milliseconds

  toInsert.id = id;
  toInsert.igd = parsed.ignitionDuration;
  toInsert.la = parsed.latitude;
  toInsert.lo = parsed.longitude;

  toInsert.m = parsed.mileage;
  toInsert.p = parsed.powervcc;
  toInsert.rid = parsed.rid; // report ID
  toInsert.rty = parsed.rty; // report Type
  toInsert.s = parsed.speed;

  // GPS signal status update only
  toInsert.satelliteNumber = parsed.satelliteNumber;
  toInsert.v = parsed.powervcc;
  toInsert.vid = vehicle.id;

  toInsert.vin = parsed.vin;

  if (parsed.cmd === "TOW") {
    toInsert.ig = false;
    toInsert.mo = true;
  }

  switch (parsed.friendlyStatus) {
    case "fake tow":
      toInsert.ig = false;
      toInsert.mo = true;
      toInsert.faketow = true;
      break;
    case "ignition off rest":
      toInsert.ig = false;
      toInsert.mo = false;
      break;
    case "ignition off motion":
      toInsert.ig = false;
      toInsert.mo = true;
      break;
    case "ignition on rest":
      toInsert.ig = true;
      toInsert.mo = false;
      break;
    case "ignition on motion":
      toInsert.ig = true;
      toInsert.mo = true;
      break;
    case "sensor rest":
      toInsert.mo = false;
      break;
    case "sensor motion":
      toInsert.mo = true;
      break;
  }

  // reverse geocode
  if (geocode && isFinite(parsed.latitude) && isFinite(parsed.longitude)) {
    try {
      let address = await reversegeo(parsed.latitude, parsed.longitude);
      toInsert.ad = address;
    } catch (e) {
      log.error(e);
    }
  }

  // get the last row
  // let previous = await r.table('vehiclehistory').filter({vid: toInsert.vid}).limit(1);

  // if (Status.isStationaryStatus(previous) && Status.isStationaryStatus(toInsert)) {
  // 	// rolluppable. delete previous
  // 	r.table('vehiclehistory').get(previous.id).delete();
  // }

  // delete NaNs/Infinity as RethinkDB will reject them
  deleteNonFiniteValues(toInsert);

  // has to happen after deleteNonFiniteValues, otherwise "TypeError: Cannot convert object to primitive value"
  if (parsed.jes != null) {
    toInsert.jes = parsed.jes;
    deleteNonFiniteValues(toInsert.jes);
  }

  const vehicleUpdate = {
    deviceBatteryPercent: toInsert.bp
  };

  if (parsed.obd) {
    const obd = parsed.obd;
    deleteNonFiniteValues(obd);
    toInsert.obd = obd;
    vehicleUpdate.obd = obd;
  }

  if (isNotVerbose(toInsert)) {
    // If incoming is not verbose, change the lastVerbose and "last" properties
    vehicleUpdate.last = toInsert;
    vehicleUpdate.lastVerbose = toInsert;
  } else {
    // If incoming is verbose, only change the lastVerbose, but not "last" property
    vehicleUpdate.lastVerbose = toInsert;
  }

  const replacerObj = Object.create(null);
  Object.keys(vehicleUpdate).forEach(function(key) {
    replacerObj[key] = true;
  });

  log.trace({
    imei: parsed.imei,
    historyUpdate: toInsert,
  });

  await r
    .table("vehicles")
    .get(vehicle.id)
    .replace(function(vehicle) {
      return vehicle.without(replacerObj);
    });

  await r
    .table("vehicles")
    .get(vehicle.id)
    .update(vehicleUpdate);
  await r.table("vehiclehistory").insert(toInsert);

  if (sack) {
    sendSack(parsed, remote);
  }
});
