/* Copyright (c) 2016 Grant Miner */
"use strict";
const _ = require("lodash");
const dao = require("../dao");
const moment = require("moment");

const nodeExcel = require("excel-export");
const KilometersToMiles = require("kilometers-to-miles");
const getStatus = require("../../../common/status").getStatus;
const cleanData = require("../../../common/helpers").cleanData;
const getAccuracy = require("../../../common/helpers").getAccuracy;
const nullToBlank = require("../../../common/helpers").nullToBlank;
const onlyVisibleHistory = require("../../../common/helpers")
  .onlyVisibleHistory;
const addStartStop = require("../../../common/helpers").addStartStop;
const rollup = require("../../../common/helpers").rollup;
const ignitionMileage = require("../../../common/helpers").ignitionMileage;
const startStopMileage = require("../../../common/helpers").startStopMileage;
const todir = require("../../../common/todir");
const tomiles = require("../../../common/tomiles");
const reports = require("../reports");
const street = require("../../../common/addressdisplay").street;
const city = require("../../../common/addressdisplay").city;
const state = require("../../../common/addressdisplay").state;
const milesfield = require("../../../common/milesfield");

module.exports = async (ctx, next) => {
  const showLatLong = ctx.query.latlong === "true";
  const tzOffset = ctx.query.tzOffset ? Number.parseInt(ctx.query.tzOffset) : 0;
  const verbose = ctx.query.verbose === "true";

  const rollupStationaryEvents = ctx.query.rollupStationaryEvents === "true";
  const calculateDistanceBetween = ctx.query.calculateDistanceBetween;
  const startDate = new Date(ctx.query.startDate);
  const endDate = new Date(ctx.query.endDate);
  const reverse = ctx.query.reverse === "true";

  let history = await dao.getVehicleHistory(
    ctx.params.orgid,
    ctx.params.id,
    startDate,
    endDate
  );

  if (ctx.query.format === "excel") {
    if (!verbose) {
      history = onlyVisibleHistory(history);
    }
    history = cleanData(history);
    history = addStartStop(history);

    if (rollupStationaryEvents) {
      history = rollup(history);
    }

    if (calculateDistanceBetween === "ignition") {
      history = ignitionMileage(history);
    } else {
      history = startStopMileage(history);
    }

    if (reverse) {
      history = history.reverse();
    }

    let conf = {};
    // conf.stylesXmlFile = "styles.xml";
    conf.cols = [
      {
        caption: "UTC time",
        type: "string",
        width: 25,
        beforeCellWrite: (function() {
          return function(row, cellData, eOpt) {
            return new Date(cellData).toISOString();
          };
        })()
      },
      {
        caption: "Local Time (" + tzOffset + " minutes offset from UTC)",
        type: "date",
        width: 20,
        beforeCellWrite: (function() {
          let originDate = new Date(Date.UTC(1899, 11, 30));
          return function(row, cellData, eOpt) {
            return (
              (cellData - originDate + tzOffset * 60 * 1000) /
              (24 * 60 * 60 * 1000)
            );
          };
        })()
      },
      // individual vehicle history
      { caption: "Address", type: "string", width: 35 },
      { caption: "City", type: "string", width: 25 },
      { caption: "State", type: "string", width: 15 },
      { caption: "Miles", type: "string", width: 20 }
    ];

    if (verbose) {
      conf.cols.push({ caption: "Odometer", type: "number", width: 15 });
      conf.cols.push({ caption: "Hour Meter", type: "string", width: 20 });
    }
    conf.cols.push({ caption: "Dir", type: "string", width: 5 });
    conf.cols.push({ caption: "Speed", type: "number", width: 10 });

    if (showLatLong) {
      conf.cols.push({ caption: "Lat", type: "number", width: 10 });
      conf.cols.push({ caption: "Long", type: "number", width: 10 });
    }

    conf.cols.push({ caption: "Status", type: "string", width: 20 });

    if (verbose) {
      conf.cols.push({ caption: "Online", type: "string", width: 5 });
      conf.cols.push({ caption: "Battery", type: "number", width: 5 });
    }

    conf.cols.push({ caption: "GPS", type: "string", width: 8 });

    conf.rows = history.map(function(item) {
      const arr = [
        nullToBlank(item.d),
        nullToBlank(item.d),
        nullToBlank(street(item)),
        nullToBlank(city(item)),
        nullToBlank(state(item)),
        nullToBlank(milesfield(item))
      ];

      if (verbose) {
        arr.push(nullToBlank(tomiles(item.m)));
        arr.push(nullToBlank(item.h));
      }

      arr.push(nullToBlank(todir(item)));
      arr.push(nullToBlank(tomiles(item.s)));

      if (showLatLong) {
        arr.push(nullToBlank(item.la));
        arr.push(nullToBlank(item.lo));
      }

      arr.push(nullToBlank(getStatus(item)));

      if (verbose) {
        arr.push(nullToBlank(item.b ? "Buffered" : "Yes"));
        arr.push(nullToBlank(item.bp));
      }

      arr.push(nullToBlank(getAccuracy(item.g)));

      return arr;
    });

    const result = nodeExcel.execute(conf);
    ctx.body = new Buffer(result, "binary");
    ctx.set("Content-Type", "application/vnd.openxmlformats");
    ctx.set(
      "Content-Disposition",
      "attachment; filename=" +
        "VehicleHistoryReport" +
        moment().format("YYYY-M-DD-HH-MM-SS") +
        ".xlsx"
    );
  } else {
    ctx.body = history;
  }
};
