/* Copyright (c) 2016 Grant Miner */
"use strict";
const t = require("../i18n").translate;
const toMiles = require("../tomiles");
const m = require("mithril");
const tohms = require("./tohms");
const street = require("../../common/addressdisplay").street;
const city = require("../../common/addressdisplay").city;
const state = require("../../common/addressdisplay").state;
const _ = require("lodash");
const formatDate = require("../formatDate");

// need location, city, state, idleStart, idleEnd, duration
//total: vehicle, idling total
module.exports.view = function(vnode) {
  if (!(vnode && vnode.attrs)) {
    return "";
  }
  const args = vnode.attrs;

  return m("div", [
    m("div", [
      m("table.table-condensed table-bordered table-striped dataTable", [
        m("thead", [
          m("td", t("Date")),
          m("td", t("Location")),
          m("td", t("City")),
          m("td", t("State")),
          m("td", t("RPM max")),
          m("td", t("RPM avg")),
          m("td", t("Throttle max")),
          m("td", t("Throttle avg")),
          m("td", t("Engine Load max")),
          m("td", t("Engine Load avg"))
        ]),
        m(
          "tbody",
          _.map(Object.keys(args.result.vehicles), function(vid) {
            return args.result.results[vid].length > 0
              ? [
                  m(
                    "tr",
                    m("td[colspan=18].group", args.result.vehicles[vid].name)
                  ),
                  _.map(args.result.results[vid], function(result) {
                    if (!result.obd) {
                      result.obd = Object.create(null);
                    }

                    if (!result.obd.diagnosticTroubleCodes) {
                      result.obd.diagnosticTroubleCodes = [];
                    }

                    return m("tr", [
                      m("td", formatDate(result.d)),
                      m("td", street(result)),
                      m("td", city(result)),
                      m("td", state(result)),
                      m("td", _.get(result, "jes.maxRPM")),
                      m("td", _.get(result, "jes.averageRPM")),
                      m("td", _.get(result, "jes.maxThrottlePosition")),
                      m("td", _.get(result, "jes.averageThrottlePosition")),
                      m("td", _.get(result, "jes.maxEngineLoad")),
                      m("td", _.get(result, "jes.averageEngineLoad"))
                    ]);
                  })
                ]
              : "";
          })
        )
      ])
    ])
  ]);
};
