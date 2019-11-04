/* Copyright (c) 2016 Grant Miner */
"use strict";
// holds socketio objects since we have one for http and https
const _ = require("lodash");
const r = require("../../common/db");
const jwtSecret = require("../../../config/web.js").jwtSecret;
const JWT = require("jsonwebtoken");
const getVehicles = require("./dao").getVehicles;
const EventEmitter = require("events").EventEmitter;

const ee = new EventEmitter();
ee.setMaxListeners(Infinity);
const ios = [];
const opts = {};

function cookiestring2object(str) {
  let result = {};
  if (str != null) {
    str = str.split("; ");
    for (let i = 0; i < str.length; i++) {
      let cur = str[i].split("=");
      result[cur[0]] = cur[1];
    }
  }
  return result;
}

const tables = [
  "vehiclehistory",
  "users",
  "organizations",
  "devices",
  "vehicles",
  "errors",
  "fleets"
];

(async function() {
  for (let table of tables) {
    const cursor = await r.table(table).changes();
    cursor.each(function(nothing, changes) {
      if (changes != null) {
        ee.emit(table, changes);
      }
    });
  }
})();

module.exports.register = function(io) {
  ios.push(io);
  io.on("connection", async function(socket) {
    const cookies = cookiestring2object(socket.handshake.headers.cookie);
    const token = cookies.jwt;

    let user;
    try {
      user = await JWT.verifyAsync(token, jwtSecret, opts);
    } catch (e) {
      // ignore random connections or invalid JWTs
      console.error(e);
      return;
    }
    const vehicleOrgs = {};

    if (user.isAdmin !== true) {
      const allVehicles = await getVehicles(user.orgid);
      allVehicles.forEach(function(item) {
        vehicleOrgs[item.id] = item.orgid;
      });
    }

    const listeners = {};
    for (let table of tables) {
      const onchange = async function(changes) {
        if (user.isAdmin === true) {
          socket.emit(table, JSON.stringify(changes));
        } else {
          let obj;
          let idKey;
          if (table === "devices") {
            idKey = "imei";
          } else {
            idKey = "id";
          }

          if (changes.old_val != null) {
            obj = _.get(changes, ["old_val"], idKey);
          } else {
            obj = _.get(changes, ["new_val"], idKey);
          }

          if (obj && obj.orgid === user.orgid) {
            socket.emit(table, JSON.stringify(changes));
          }
        }
      };
      ee.on(table, onchange);
      listeners[table] = onchange;
    }

    socket.on("disconnect", function() {
      Object.keys(listeners).forEach(function(key) {
        ee.removeListener(key, listeners[key]);
      });
    });
  });
};
