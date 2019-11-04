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
  let status = _.flattenDeep(await dao.getVehicles(ctx.params.orgid));

  if (ctx.query.format === "excel") {
    status = cleanData(status);
    const conf = {};
    // conf.stylesXmlFile = "styles.xml";
    conf.cols = [
      { caption: "Name", type: "string", width: 40 },
      {
        caption: "UTC",
        type: "string",
        width: 25,
        beforeCellWrite: (function() {
          return function(row, cellData, eOpt) {
            try {
              return new Date(cellData).toISOString();
            } catch (e) {
              return e.stack;
            }
          };
        })()
      },
      {
        caption: "Local Time (" + tzOffset + " minutes offset)",
        type: "date",
        width: 20,
        beforeCellWrite: (function() {
          const originDate = new Date(Date.UTC(1899, 11, 30));
          return function(row, cellData, eOpt) {
            return (
              (cellData - originDate + tzOffset * 60 * 1000) /
              (24 * 60 * 60 * 1000)
            );
          };
        })()
      },
      // fleet history
      { caption: "Address", type: "string", width: 35 },
      { caption: "City", type: "string", width: 25 },
      { caption: "State", type: "string", width: 15 }
    ];

    if (verbose) {
      conf.cols.push({ caption: "Odometer", type: "number", width: 20 });
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

    conf.rows = status.map(function(item) {
      if (!item.last) {
        item.last = {};
      }
      let arr = [
        nullToBlank(item.name),
        nullToBlank(item.last.d),
        nullToBlank(item.last.d),
        nullToBlank(street(item.last)),
        nullToBlank(city(item.last)),
        nullToBlank(state(item.last))
      ];

      if (verbose) {
        arr.push(nullToBlank(tomiles(item.last.m)));
        arr.push(nullToBlank(item.last.h));
      }

      arr.push(nullToBlank(todir(item.last)));

      arr.push(nullToBlank(tomiles(item.last.s)));

      if (showLatLong) {
        arr.push(nullToBlank(item.last.la));
        arr.push(nullToBlank(item.last.lo));
      }

      arr.push(nullToBlank(getStatus(item.last)));

      if (verbose) {
        arr.push(nullToBlank(item.last.b ? "Buffered" : "Yes"));
        arr.push(nullToBlank(item.last.bp));
      }

      arr.push(nullToBlank(getAccuracy(item.last.g)));

      return arr;
    });

    const result = nodeExcel.execute(conf);
    ctx.body = new Buffer(result, "binary");
    ctx.set("Content-Type", "application/vnd.openxmlformats");
    ctx.set(
      "Content-Disposition",
      "attachment; filename=" +
        "ActivityReport" +
        moment().format("YYYY-M-DD-HH-MM-SS") +
        ".xlsx"
    );
  } else {
    ctx.body = status;
  }
};
