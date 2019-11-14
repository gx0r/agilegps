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
const isUserMetric = require("../isUserMetric");
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
          m("td", t("Conn")),
          m("td", "⚠"),
          m("td", t("Codes")),
          m("td", t("Temp")),
          m("td", t("Fuel")),
          m("td", t("Load")),
          m("td", t("ThrtlPos")),
          m("td", t("RPMs")),
          m("td", t("Fuel Cnsmp")),
          m("td", t("PIDs")),
          m("td", t("Speed")),
          m("td", t("Power")),
          m("td", t("VIN")),
          m("td", isUserMetric() ? t("OBD Kilometers") : t("OBD Mileage")),
          m("td", isUserMetric() ? t("Kilometers") : t("Miles"))
          // m('td', 'OBD-II Data')
        ]),
        m(
          "tbody",
          _.map(Object.keys(args.result.vehicles), function(vid) {
            return args.result.results[vid].length > 0
              ? [
                  m(
                    "tr",
                    m("td[colspan=19].group", args.result.vehicles[vid].name)
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
                      m("td", result.obd.connect ? "✓" : ""),
                      m(
                        "td",
                        result.obd.malfunction
                          ? result.obd.diagnosticTroubleCodes.length + "⚠"
                          : ""
                      ),
                      m(
                        "td",
                        result.obd.diagnosticTroubleCodes.map(function(code) {
                          return [
                            m(
                              "a",
                              {
                                href: "http://www.obd-codes.com/p" + code,
                                target: "_new"
                              },
                              code
                            ),
                            " "
                          ];
                        })
                      ),
                      m("td", result.obd.temp ? result.obd.temp + "℃" : ""),
                      m(
                        "td",
                        result.obd.fuelLevelInput
                          ? result.obd.fuelLevelInput + "%"
                          : ""
                      ),
                      m("td", result.obd.engineLoad),
                      m("td", result.obd.throttlePosition),
                      m("td", result.obd.RPMs),
                      m("td", result.obd.fuelConsumption),
                      m("td", result.obd.supportPIDs),
                      m("td", toMiles(result.obd.speed)),
                      m(
                        "td",
                        result.obd.powermV
                          ? result.obd.powermV / 1000 + "V"
                          : ""
                      ),
                      m("td", result.obd.vin),
                      m("td", toMiles(result.obd.mileage)),
                      m("td", toMiles(result.m))
                      // m('pre', JSON.stringify(result.obd, null, 4))
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
