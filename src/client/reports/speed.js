/* Copyright (c) 2016 Grant Miner */
"use strict";
const t = require("../i18n").translate;
const m = require("mithril");
const tomiles = require("../tomiles");
const todir = require("../../common/todir");
const street = require("../../common/addressdisplay").street;
const city = require("../../common/addressdisplay").city;
const state = require("../../common/addressdisplay").state;
const _ = require("lodash");
const isUserMetric = require("../isUserMetric");
const formatDate = require("../formatDate");

function renderLocation(item) {
  let res = "";
  if (street(item) !== "") {
    res = res + street(item);
  }
  if (city(item) !== "") {
    res = res + ", " + city(item);
  }
  if (state(item) !== "") {
    res = res + ", " + state(item);
  }
  return res;
}

module.exports.view = function(vnode) {
  if (!(vnode && vnode.attrs)) {
    return "";
  }
  const args = vnode.attrs;

  return m("div", [
    args.result && args.result.vehicles
      ? m("div", [
          m("table.table-condensed table-bordered table-striped dataTable", [
            m("thead", [
              m("td", "Vehicle"),
              m("td", "Highest " + (isUserMetric() ? t("km/h") : t("mph")))
            ]),
            m(
              "tbody",
              _.map(Object.keys(args.result.vehicles), function(vid) {
                if (_.isFinite(tomiles(args.result.totals[vid]))) {
                  return m("tr", [
                    m("td", args.result.vehicles[vid].name),
                    m("td", tomiles(args.result.totals[vid]))
                  ]);
                }
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
          m("td", t("Date")),
          m("td", t("Heading")),
          m("td", isUserMetric() ? t("km/h") : t("mph"))
        ]),
        m(
          "tbody",
          _.map(Object.keys(args.result.vehicles), function(vid) {
            return [
              m(
                "tr",
                m("td[colspan=7].group", args.result.vehicles[vid].name)
              ),
              args.result.results[vid].map(function(item) {
                return m("tr", [
                  m("td", renderLocation(item)),
                  m("td", formatDate(item.d)),
                  m("td", todir(item)),
                  m("td", tomiles(item.s))
                ]);
              })
            ];
          })
        )
      ])
    ])
  ]);
};
