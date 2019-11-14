/* Copyright (c) 2016 Grant Miner */
"use strict";
const t = require("../i18n").translate;
const m = require("mithril");
const moment = require("moment");
const tohms = require("./tohms");
const tomiles = require("../tomiles");
const _ = require("lodash");
const isUserMetric = require("../isUserMetric");

module.exports.view = function(vnode) {
  if (!(vnode && vnode.attrs)) {
    return m("div");
  }
  const args = vnode.attrs;

  return m(
    "div",
    m("div", [
      m(
        "table.table-condensed table-bordered table-striped dataTable",
        m("thead", [
          m("td", t("Vehicle")),
          m("td", t("Transit Time")),
          m("td", isUserMetric() ? t("Kilometers") : t("Miles")),
          m("td", t("Parked Time")),
          m("td", t("Parked")),
          m("td", t("Avg Park")),
          m("td", t("Total Idling")),
          m("td", t("Idle")),
          m("td", t("Avg Idle Time")),
          m("td", t("Begin Odometer")),
          m("td", t("End Odometer"))
        ]),
        m(
          "tbody",
          _.map(Object.keys(args.result.vehicles), function(vid) {
            return m("tr", [
              m("td", args.result.vehicles[vid].name),
              m("td", tohms(args.result.results[vid].totalTransit)),
              m("td", tomiles(args.result.results[vid].distance)),
              m("td", tohms(args.result.results[vid].totalPark)),
              m("td", args.result.results[vid].parks),
              m("td", tohms(args.result.results[vid].avgPark)),
              m("td", tohms(args.result.results[vid].totalIdle)),
              m("td", args.result.results[vid].idles),
              m("td", tohms(args.result.results[vid].avgIdle)),
              m("td", tomiles(args.result.results[vid].beginOdometer)),
              m("td", tomiles(args.result.results[vid].endOdometer))
            ]);
          })
        )
      )
    ])
  );
};
