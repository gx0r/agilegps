/* Copyright (c) 2016 Grant Miner */
"use strict";
const t = require("../i18n").translate;
const m = require("mithril");
const tohms = require("./tohms");
const tomiles = require("../tomiles");
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
          m("td", t("Date")),
          m("td", t("First Ign On")),
          m("td", t("Last Ign Off")),
          m("td", t("Duration")),
          m("td", t("Begin Odometer")),
          m("td", t("End Odometer")),
          m("td", isUserMetric() ? t("Kilometers") : t("Miles"))
        ]),
        m(
          "tbody",
          _.map(Object.keys(args.result.vehicles), function(vid) {
            return args.result.results[vid].length > 0
              ? [
                  m(
                    "tr",
                    m("td[colspan=7].group", args.result.vehicles[vid].name)
                  ),
                  _.map(args.result.results[vid], function(result) {
                    return m("tr", [
                      m("td", formatDate(result.d)),
                      m(
                        "td",
                        result.firstIgnOn ? formatDate(result.firstIgnOn) : ""
                      ),
                      m(
                        "td",
                        result.lastIgnOff ? formatDate(result.lastIgnOff) : ""
                      ),
                      m("td", tohms(result.duration)),
                      m("td", tomiles(result.beginOdometer)),
                      m("td", tomiles(result.endOdometer)),
                      m("td", tomiles(result.distance))
                    ]);
                  })
                ]
              : "";
          })
        )
      ])
    ])

    // m('br'),
    //
    // args.result && args.result.vehicles ? m('div', [
    // 	// m('h3', 'Totals'),
    // 	m('table.table-condensed table-bordered table-striped dataTable', [
    // 		m('thead', [
    //             m('td', 'Vehicle'),
    // 			m('td', 'Total Durations'),
    //             m('td', 'Total Miles')
    // 		]),
    // 		m('tbody', _.map(Object.keys(args.result.vehicles), function(vid) {
    // 			return m('tr', [
    //                 m('td', args.result.vehicles[vid].name),
    //                 m('td', tohms(args.result.totals[vid])),
    //                 m('td', tohms(args.result.totals[vid]))
    // 			])
    // 		}))
    // 	])
    // ]) : '',
  ]);
};
