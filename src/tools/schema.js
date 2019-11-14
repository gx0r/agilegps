/* Copyright (c) 2016 Grant Miner */

"use strict";
// Auto creates the DB schema. Safe to run if it already exists.

const Promise = require("bluebird");
const r = require("../common/db");

function ignore(e) {
  return undefined;
}

Promise.coroutine(function*() {
  yield Promise.join(
    r.dbCreate("agilegps").catch(ignore),
    r.tableCreate("rawevents").catch(ignore),
    r.tableCreate("users", { primaryKey: "username" }).catch(ignore),
    r.tableCreate("organizations").catch(ignore),
    r.tableCreate("devices", { primaryKey: "imei" }).catch(ignore),
    r.tableCreate("vehicles").catch(ignore),
    r.tableCreate("vehiclehistory").catch(ignore),
    r.tableCreate("geocode").catch(ignore),
    r.tableCreate("errors").catch(ignore),
    r.tableCreate("fleets").catch(ignore),
    r.tableCreate("locations").catch(ignore),
    r.tableCreate("alerts").catch(ignore)
  );

  yield Promise.join(
    r
      .table("users")
      .indexCreate("username")
      .catch(ignore),
    r
      .table("geocode")
      .indexCreate("location")
      .catch(ignore),
    r
      .table("vehiclehistory")
      .indexCreate("vid")
      .catch(ignore),
    r
      .table("vehiclehistory")
      .indexCreate("d")
      .catch(ignore),
    r
      .table("vehicles")
      .indexCreate("device")
      .catch(ignore),
    r
      .table("vehicles")
      .indexCreate("orgid")
      .catch(ignore),
    r
      .table("rawevents")
      .indexCreate("date")
      .catch(ignore),
    r
      .table("rawevents")
      .indexCreate("imei")
      .catch(ignore),
    r
      .table("events")
      .indexCreate("date")
      .catch(ignore),
    r
      .table("errors")
      .indexCreate("date")
      .catch(ignore),
    r
      .table("devices")
      .indexCreate("orgid")
      .catch(ignore),
    r
      .table("users")
      .indexCreate("orgid")
      .catch(ignore),
    r
      .table("fleets")
      .indexCreate("orgid")
      .catch(ignore),
    r
      .table("locations")
      .indexCreate("orgid")
      .catch(ignore),
    r
      .table("alerts")
      .indexCreate("orgid")
      .catch(ignore)
  ),
    r
      .table("organizations")
      .insert({
        address1: "Default",
        address2: "",
        city: "Minneapolis",
        country: "USA",
        ein: "default",
        id: "default",
        name: "default",
        state: "MN",
        zip: "55419"
      })
      .catch(ignore);

  console.log("Done.");
  r.getPoolMaster().drain(); // drain connection pool to allow process to exit.
})();
