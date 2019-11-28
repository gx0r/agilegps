/* Copyright (c) 2016 Grant Miner */
"use strict";
const Promise = require("bluebird");
const _ = require("lodash");
const r = require("../../common/db");
const get = require("lodash").get;
const bunyan = require("bunyan");
const moment = require("moment");
const helpers = require("../../common/helpers");
const isIdle = require("../../common/status").isIdle;
const isPark = require("../../common/status").isPark;
const isStop = require("../../common/status").isStop;
const isTow = require("../../common/status").isTow;
const addressdisplay = require("../../common/addressdisplay");
const idleReport = require("./reports/idle");
const dailyReport = require("./reports/daily");
const mileageReport = require("./reports/mileage");
const odometerReport = require("./reports/odometer");
const startReport = require("./reports/start");
const ignitionReport = require("./reports/ignition");
const speedReport = require("./reports/speed");
const summaryReport = require("./reports/summary");
const obdReport = require("./reports/obd");
const jesReport = require("./reports/jes");

const log = bunyan.createLogger({
  name: "reports",
  level: "debug"
});

function ignoreCaseEquals(a, b) {
  return new RegExp("^" + a + "$", "i").test(b);
}
module.exports.getReport = async function(
  orgid,
  reportid,
  vehicles,
  startDate,
  endDate,
  tzOffset
) {
  startDate = new Date(startDate);
  endDate = new Date(endDate);

  // log.debug(
  //   "Report Start: " +
  //     moment(startDate)
  //       .utc()
  //       .format()
  // );
  // log.debug(
  //   "Report End: " +
  //     moment(endDate)
  //       .utc()
  //       .format()
  // );

  const result = {
    query: {
      orgid: orgid,
      reportid: reportid,
      startDate: startDate,
      endDate: endDate,
      tzOffset: tzOffset,
      vehicles: vehicles
    },
    vehicles: {},
    results: {},
    totals: {}
  };

  await Promise.map(
    vehicles,
    async function(vid) {
      const vehicle = await r.table("vehicles").get(vid);
      if (vehicle.orgid !== orgid) {
        // security check each vehicle so end user can't insert any vehicle ID into the request
        // logger.warn
        // throw new Error(
        //   vid + " does not exist or you do not have access to it"
        // );
      } else {
        result.vehicles[vid] = vehicle;
      }
    },
    {
      concurrency: 1
    }
  );

  await Promise.map(
    vehicles,
    async function(vid) {
      const history = await r
        .table("vehiclehistory")
        .between(startDate, endDate, {
          index: "d",
          leftBound: "closed",
          rightBound: "open"
        })
        .filter({
          vid: vid
        })
        .orderBy("id");

      switch (reportid) {
        case "idle":
          const reportResults = idleReport(history);
          result.results[vid] = reportResults.results;
          result.totals[vid] = reportResults.totals;
          break;

        case "daily":
          result.results[vid] = dailyReport(history, tzOffset);
          break;

        case "mileage":
          result.results[vid] = mileageReport(history, result.totals);
          break;

        case "odometer":
          result.results[vid] = odometerReport(history);
          break;

        case "start":
          result.results[vid] = startReport(history);
          break;

        case "ignition":
          result.results[vid] = ignitionReport(history);
          break;

        case "speed":
          const threshold = 112.654; // 70 mph
          result.results[vid] = speedReport(history, threshold);
          result.totals[vid] = _.max(
            _.map(history, function(item) {
              return item.s;
            })
          );
          break;

        case "summary":
          result.results[vid] = Object.assign(summaryReport(history), {
            name: vid
          });
          break;

        case "obd":
          result.results[vid] = obdReport(history);
          break;

        case "jes":
          result.results[vid] = jesReport(history);
          break;

        default:
          throw new Error("Unknown report type " + reportid);
      }
    },
    {
      concurrency: 1
    }
  );

  return result;
};
