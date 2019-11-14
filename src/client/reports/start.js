/* Copyright (c) 2016 Grant Miner */
"use strict";
const t = require("../i18n").translate;
const m = require("mithril");
const tomiles = require("../tomiles");
const Status = require("../../common/status");
const tohms = require("./tohms");
// const street = require('../../common/addressdisplay').street;
const full = require("../../common/addressdisplay").full;
const _ = require("lodash");
const isUserMetric = require("../isUserMetric");
const formatDate = require("../formatDate");

module.exports.view = function(vnode) {
  if (!(vnode && vnode.attrs)) {
    return "";
  }
  const args = vnode.attrs;

  return m("div", [
    m("div", [
      m("table.table-condensed table-bordered table-striped dataTable", [
        m("thead", [
          m("td", t("Started Moving")),
          m("td", t("Stopped Moving")),
          m("td", t("Transit Time")),
          m("td", isUserMetric() ? t("Kilometers") : t("Miles")),
          m("td", t("Parked @")),
          m("td", t("Parked Until")),
          m("td", t("Parked Time")),
          m("td", t("Idle Time"))
        ]),
        m(
          "tbody",
          _.map(Object.keys(args.result.vehicles), function(vid) {
            return [
              m(
                "tr",
                m("td[colspan=8].group", args.result.vehicles[vid].name)
              ),
              args.result.results[vid].map(function(item) {
                return m("tr", [
                  m("td", item.startTime ? formatDate(item.startTime) : ""),
                  m("td", formatDate(item.d)),
                  m("td", item.transitTime ? tohms(item.transitTime) : ""),
                  m("td", tomiles(item.startStopMileage)),
                  m("td", full(item)),
                  m("td", item.parkedEnd ? formatDate(item.parkedEnd) : ""),
                  m(
                    "td",
                    item.parkedDuration ? tohms(item.parkedDuration) : ""
                  ),
                  m("td", item.idleDuration ? tohms(item.idleDuration) : "")
                ]);
              })
            ];
          })
        )
      ])
    ])
  ]);
};
