/* Copyright (c) 2016 Grant Miner */
"use strict";
import { translate as t } from "../i18n";

const m = require("mithril");
const navbar = require("../navbar");
// const DatePicker = require('sm-datepicker');
const moment = require("moment");
const types = require("../../common/report/types");
const tzOffset = require("../tzoffset");
const pikaday = require("pikaday2").default;

const idle = require("./idle");
const daily = require("./daily");
const mileage = require("./mileage");
const odometer = require("./odometer");
const speed = require("./speed");
const ignition = require("./ignition");
const start = require("./start");
const summary = require("./summary");
const obd = require("./obd");
const jes = require("./jes");
const _ = require("lodash");
const withAuth = require("../withAuth");

const appState = require("../appState");

module.exports.controller = function(args, extras) {
  const ctrl = this;

  ctrl.executing = false;
  ctrl.error = null;

  ctrl.result = m.prop({
    query: {
      vehicles: []
    },
    results: {},
    totals: {}
  });

  ctrl.reportName = m.prop("idle");
  ctrl.startDate = m.prop(
    moment()
      .startOf("day")
      .toDate()
  );
  ctrl.endDate = m.prop(
    moment()
      .startOf("day")
      .toDate()
  );

  ctrl.dateRangeChange = function(ev) {
    if (ev === "Today") {
      ctrl.startDatePicker.setDate(
        moment()
          .startOf("day")
          .add(1, "days")
          .format("YYYY-MM-DD")
      );
      ctrl.endDatePicker.setDate(
        moment()
          .startOf("day")
          .add(1, "days")
          .format("YYYY-MM-DD")
      );
    }
    if (ev === "Yesterday") {
      ctrl.startDatePicker.setDate(
        moment()
          .startOf("day")
          .format("YYYY-MM-DD")
      );
      ctrl.endDatePicker.setDate(
        moment()
          .startOf("day")
          .add(0, "days")
          .format("YYYY-MM-DD")
      );
    }
    if (ev === "Last 2 Days") {
      ctrl.startDatePicker.setDate(
        moment()
          .startOf("day")
          .subtract(0, "days")
          .format("YYYY-MM-DD")
      );
      ctrl.endDatePicker.setDate(
        moment()
          .startOf("day")
          .add(1, "days")
          .format("YYYY-MM-DD")
      );
    }
    if (ev === "Last 3 Days") {
      ctrl.startDatePicker.setDate(
        moment()
          .startOf("day")
          .subtract(1, "days")
          .format("YYYY-MM-DD")
      );
      ctrl.endDatePicker.setDate(
        moment()
          .startOf("day")
          .add(1, "days")
          .format("YYYY-MM-DD")
      );
    }
    if (ev === "This week to date") {
      ctrl.startDatePicker.setDate(
        moment()
          .startOf("day")
          .subtract(7, "days")
          .format("YYYY-MM-DD")
      );
      ctrl.endDatePicker.setDate(
        moment()
          .startOf("day")
          .add(1, "days")
          .format("YYYY-MM-DD")
      );
    }
    if (ev === "Last week") {
      ctrl.startDatePicker.setDate(
        moment()
          .startOf("day")
          .subtract(1, "week")
          .format("YYYY-MM-DD")
      );
      ctrl.endDatePicker.setDate(
        moment()
          .startOf("day")
          .format("YYYY-MM-DD")
      );
    }
    if (ev === "This month") {
      ctrl.startDatePicker.setDate(
        moment()
          .startOf("month")
          .add(1, "days")
          .format("YYYY-MM-DD")
      );
      ctrl.endDatePicker.setDate(
        moment()
          .startOf("month")
          .add(1, "month")
          .add(0, "days")
          .format("YYYY-MM-DD")
      );
    }
    if (ev === "Last month") {
      ctrl.startDatePicker.setDate(
        moment()
          .startOf("month")
          .subtract(1, "month")
          .add(1, "days")
          .format("YYYY-MM-DD")
      );
      ctrl.endDatePicker.setDate(
        moment()
          .startOf("month")
          .add(0, "days")
          .format("YYYY-MM-DD")
      );
    }
  };

  ctrl.run = function() {
    ctrl.result({});
    ctrl.executing = true;
    ctrl.error = null;
    m.redraw();

    const state = appState.getState();
    const IDs = [];
    state.impliedSelectedVehicles.forEach(function(vehicle) {
      IDs.push(vehicle.id);
    });

    m.request({
      url:
        "/api/organizations/" +
        state.selectedOrg.id +
        "/reports/" +
        encodeURIComponent(ctrl.reportName()) +
        "?vehicles=" +
        encodeURIComponent(JSON.stringify(IDs)) +
        "&startDate=" +
        encodeURIComponent(ctrl.startDate().toISOString()) +
        "&endDate=" +
        encodeURIComponent(
          moment(ctrl.endDate())
            .add(1, "day")
            .toISOString()
        ) +
        //
        // + '&startDate=' + encodeURIComponent(state.startDate.toISOString())
        // + '&endDate=' + encodeURIComponent(moment(state.startDate).add(1, 'day').toISOString())
        "&tzOffset=" +
        encodeURIComponent(tzOffset()),
      config: withAuth
    })
      .then(function(results) {
        ctrl.result(results);
        ctrl.executing = false;
      })
      .catch(function(err) {
        ctrl.executing = false;
        ctrl.error = err;
        throw err;
      });
  };
};

module.exports.view = function(ctrl, args, extras) {
  return m(".div", [
    m(
      "div.business-table",
      m(".row", [
        m(
          "div.col-md-12",
          {
            style: {
              "margin-top": "1em",
              "margin-bottom": "1em"
            }
          },
          [
            m("span", t("Quick select") + " "),
            m("span.button-group", [
              m(
                "button.btn btn-default",
                {
                  onclick: function() {
                    this.blur();
                    ctrl.dateRangeChange("Today");
                  }
                },
                t("Today")
              ),

              m(
                "button.btn btn-default",
                {
                  onclick: function() {
                    this.blur();
                    ctrl.dateRangeChange("Yesterday");
                  }
                },
                t("Yesterday")
              ),

              m(
                "button.btn btn-default",
                {
                  onclick: function() {
                    this.blur();
                    ctrl.dateRangeChange("Last 2 Days");
                  }
                },
                t("Last 2 Days")
              ),

              m(
                "button.btn btn-default",
                {
                  onclick: function() {
                    this.blur();
                    ctrl.dateRangeChange("Last 3 Days");
                  }
                },
                t("Last 3 Days")
              ),

              // m('button.btn btn-default', {
              // 	onclick: function () {
              // 		this.blur();
              // 		ctrl.dateRangeChange('This week to date');
              // 	}
              // }, t('This week to date')),

              m(
                "button.btn btn-default",
                {
                  onclick: function() {
                    this.blur();
                    ctrl.dateRangeChange("Last week");
                  }
                },
                t("Last week")
              ),

              m(
                "button.btn btn-default",
                {
                  onclick: function() {
                    this.blur();
                    ctrl.dateRangeChange("This month");
                  }
                },
                t("Last month")
              )

              // m('button.btn btn-default', {
              // 	onclick: function () {
              // 		this.blur();
              // 		ctrl.dateRangeChange('Last month');
              // 	}
              // }, t('This month'))
            ])
          ]
        ),
        m(
          "div.col-md-12",
          {
            style: {
              "margin-top": "1em",
              "margin-bottom": "1em"
            }
          },
          [
            m("label.padrt", t("Start Date")),
            m("span.padrt", {
              config: function(el, isInitialized) {
                if (isInitialized) return;
                const input = document.createElement("input");
                el.appendChild(input);

                ctrl.startDatePicker = new pikaday({
                  defaultDate: ctrl.startDate(),
                  setDefaultDate: true,
                  field: input,
                  onSelect: function() {
                    ctrl.startDate(this.getDate());
                    m.redraw();
                  }
                });
              }
            }),
            m("label.padrt", t("End Date")),
            m("span", {
              config: function(el, isInitialized) {
                if (isInitialized) return;
                const input = document.createElement("input");
                el.appendChild(input);

                ctrl.endDatePicker = new pikaday({
                  defaultDate: ctrl.endDate(),
                  setDefaultDate: true,
                  field: input,
                  onSelect: function() {
                    ctrl.endDate(this.getDate());
                    m.redraw();
                  }
                });
              }
            })
          ]
        ),
        m(
          "div.col-md-3",
          m(
            "select.form-control",
            {
              size: Object.keys(types).length,
              onchange: m.withAttr("value", ctrl.reportName)
            },
            Object.keys(types).map(function(key) {
              return m(
                "option",
                {
                  value: key,
                  selected: key === ctrl.reportName()
                },
                t(types[key])
              );
            })
          ),
          m(
            "button.btn btn-default btn-success",
            {
              style: {
                "margin-top": "1em",
                "margin-bottom": "1em"
              },
              disabled: ctrl.executing,
              onclick: ctrl.run
            },
            ctrl.executing ? t("Executing...") : t("Run!")
          )
        ),

        m(".row.col-md-12", [
          ctrl.result().query && ctrl.result().query.reportid === "idle"
            ? m.component(idle, {
                result: ctrl.result
              })
            : "",

          ctrl.result().query && ctrl.result().query.reportid === "daily"
            ? m.component(daily, {
                result: ctrl.result
              })
            : "",

          ctrl.result().query && ctrl.result().query.reportid === "mileage"
            ? m.component(mileage, {
                result: ctrl.result
              })
            : "",

          ctrl.result().query && ctrl.result().query.reportid === "odometer"
            ? m.component(odometer, {
                result: ctrl.result
              })
            : "",

          ctrl.result().query && ctrl.result().query.reportid === "speed"
            ? m.component(speed, {
                result: ctrl.result
              })
            : "",

          ctrl.result().query && ctrl.result().query.reportid === "ignition"
            ? m.component(ignition, {
                result: ctrl.result
              })
            : "",

          ctrl.result().query && ctrl.result().query.reportid === "start"
            ? m.component(start, {
                result: ctrl.result
              })
            : "",

          ctrl.result().query && ctrl.result().query.reportid === "summary"
            ? m.component(summary, {
                result: ctrl.result
              })
            : "",

          ctrl.result().query && ctrl.result().query.reportid === "obd"
            ? m.component(obd, {
                result: ctrl.result
              })
            : "",

          ctrl.result().query && ctrl.result().query.reportid === "jes"
            ? m.component(jes, {
                result: ctrl.result
              })
            : "",
          // ,m('div.business-table', [
          // 	m('pre', JSON.stringify(ctrl.result(), undefined, 4))
          // ])

          ctrl.error
            ? m("div.business-table", [
                m("pre", JSON.stringify(ctrl.error, undefined, 4))
              ])
            : null
        ])
      ])
    )
  ]);
};
