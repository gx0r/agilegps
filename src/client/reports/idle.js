/* Copyright (c) 2016 Grant Miner */
"use strict";
const t = require("../i18n").translate;
const m = require("mithril");
const moment = require("moment");
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
    args.result && args.result.vehicles
      ? m("div", [
          // m('h3', 'Totals'),
          m("table.table-condensed table-bordered table-striped dataTable", [
            m("thead", [m("td", t("Vehicle")), m("td", t("Idling Total"))]),
            m(
              "tbody",
              _.map(Object.keys(args.result.vehicles), function(vid) {
                return m("tr", [
                  m("td", args.result.vehicles[vid].name),
                  m("td", tohms(args.result.totals[vid] / 1000))
                ]);
              })
            )
          ])
        ])
      : "",

    m("br"),

    m("div", [
      m("table.table-condensed table-bordered table-striped dataTable", [
        m("thead", [
          m("td", t("Location")),
          m("td", t("City")),
          m("td", t("State")),
          m("td", t("Idle Start")),
          m("td", t("Idle End")),
          m("td", t("Duration"))
        ]),
        m(
          "tbody",
          _.map(Object.keys(args.result.vehicles), function(vid) {
            return args.result.results[vid].length > 0
              ? [
                  m(
                    "tr",
                    m("td[colspan=6].group", args.result.vehicles[vid].name)
                  ),
                  _.map(args.result.results[vid], function(result) {
                    return m("tr", [
                      m("td", street(result)),
                      m("td", city(result)),
                      m("td", state(result)),
                      m("td", formatDate(result.d)),
                      m(
                        "td",
                        formatDate(
                          moment(result.d).add(
                            result.idleTime / 1000,
                            "seconds"
                          )
                        )
                      ),
                      m("td", tohms(result.idleTime / 1000))
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
