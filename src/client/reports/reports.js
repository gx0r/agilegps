/* Copyright (c) 2016 Grant Miner */
"use strict";
const t = require("../i18n").translate;
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

module.exports.oninit = function() {
  this.executing = false;
  this.error = null;

  this.result = {
    query: {
      vehicles: []
    },
    results: {},
    totals: {}
  };

  this.reportName = "idle";
  this.startDate = moment()
      .startOf("day")
      .toDate();
  this.endDate = moment()
      .startOf("day")
      .toDate();

  this.dateRangeChange = ev => {
    if (ev === "Today") {
      this.startDatePicker.setDate(
        moment()
          .startOf("day")
          .add(1, "days")
          .format("YYYY-MM-DD")
      );
      this.endDatePicker.setDate(
        moment()
          .startOf("day")
          .add(1, "days")
          .format("YYYY-MM-DD")
      );
    }
    if (ev === "Yesterday") {
      this.startDatePicker.setDate(
        moment()
          .startOf("day")
          .format("YYYY-MM-DD")
      );
      this.endDatePicker.setDate(
        moment()
          .startOf("day")
          .add(0, "days")
          .format("YYYY-MM-DD")
      );
    }
    if (ev === "Last 2 Days") {
      this.startDatePicker.setDate(
        moment()
          .startOf("day")
          .subtract(0, "days")
          .format("YYYY-MM-DD")
      );
      this.endDatePicker.setDate(
        moment()
          .startOf("day")
          .add(1, "days")
          .format("YYYY-MM-DD")
      );
    }
    if (ev === "Last 3 Days") {
      this.startDatePicker.setDate(
        moment()
          .startOf("day")
          .subtract(1, "days")
          .format("YYYY-MM-DD")
      );
      this.endDatePicker.setDate(
        moment()
          .startOf("day")
          .add(1, "days")
          .format("YYYY-MM-DD")
      );
    }
    if (ev === "This week to date") {
      this.startDatePicker.setDate(
        moment()
          .startOf("day")
          .subtract(7, "days")
          .format("YYYY-MM-DD")
      );
      this.endDatePicker.setDate(
        moment()
          .startOf("day")
          .add(1, "days")
          .format("YYYY-MM-DD")
      );
    }
    if (ev === "Last week") {
      this.startDatePicker.setDate(
        moment()
          .startOf("day")
          .subtract(1, "week")
          .format("YYYY-MM-DD")
      );
      this.endDatePicker.setDate(
        moment()
          .startOf("day")
          .format("YYYY-MM-DD")
      );
    }
    if (ev === "This month") {
      this.startDatePicker.setDate(
        moment()
          .startOf("month")
          .add(1, "days")
          .format("YYYY-MM-DD")
      );
      this.endDatePicker.setDate(
        moment()
          .startOf("month")
          .add(1, "month")
          .add(0, "days")
          .format("YYYY-MM-DD")
      );
    }
    if (ev === "Last month") {
      this.startDatePicker.setDate(
        moment()
          .startOf("month")
          .subtract(1, "month")
          .add(1, "days")
          .format("YYYY-MM-DD")
      );
      this.endDatePicker.setDate(
        moment()
          .startOf("month")
          .add(0, "days")
          .format("YYYY-MM-DD")
      );
    }
  };

  this.run = () => {
    this.result = {};
    this.executing = true;
    this.error = null;
    m.redraw();

    const state = appState.getState();
    const IDs = [];
    state.impliedSelectedVehicles.forEach(vehicle => IDs.push(vehicle.id));

    m.request({
      url:
        "/api/organizations/" +
        state.selectedOrg.id +
        "/reports/" +
        encodeURIComponent(this.reportName) +
        "?vehicles=" +
        encodeURIComponent(JSON.stringify(IDs)) +
        "&startDate=" +
        encodeURIComponent(this.startDate.toISOString()) +
        "&endDate=" +
        encodeURIComponent(
          moment(this.endDate)
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
      .then(results => {
        this.result = results;
        this.executing = false;
      })
      .catch(err => {
        this.executing = false;
        this.error = err;
        throw err;
      });
  };
};

module.exports.view = function(vnode) {
  const self = this;

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
                  onclick: ev => {
                    this.dateRangeChange("Today");
                    ev.target.blur();
                  }
                },
                t("Today")
              ),

              m(
                "button.btn btn-default",
                {
                  onclick: ev => {
                    this.dateRangeChange("Yesterday");
                    ev.target.blur();
                  }
                },
                t("Yesterday")
              ),

              m(
                "button.btn btn-default",
                {
                  onclick: ev => {
                    this.dateRangeChange("Last 2 Days");
                    ev.target.blur();
                  }
                },
                t("Last 2 Days")
              ),

              m(
                "button.btn btn-default",
                {
                  onclick: ev => {
                    this.dateRangeChange("Last 3 Days");
                    ev.target.blur();
                  }
                },
                t("Last 3 Days")
              ),

              // m('button.btn btn-default', {
              // 	onclick: ev => {
              // 		this.dateRangeChange('This week to date');
              //    ev.target.blur();
              // 	}
              // }, t('This week to date')),

              m(
                "button.btn btn-default",
                {
                  onclick: ev => {
                    this.dateRangeChange("Last week");
                    ev.target.blur();
                  }
                },
                t("Last week")
              ),

              m(
                "button.btn btn-default",
                {
                  onclick: ev => {
                    this.dateRangeChange("This month");
                    ev.target.blur();
                  }
                },
                t("Last month")
              )

              // m('button.btn btn-default', {
              // 	onclick: ev => {
              // 		this.dateRangeChange('Last month');
              // 		ev.target.blur();
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
              oncreate: vnode => {
                const input = document.createElement("input");
                vnode.dom.appendChild(input);

                this.startDatePicker = new pikaday({
                  defaultDate: this.startDate,
                  setDefaultDate: true,
                  field: input,
                  onSelect: function() {
                    self.startDate = this.getDate();
                    m.redraw();
                  }
                });
              }
            }),
            m("label.padrt", t("End Date")),
            m("span", {
              oncreate: vnode => {
                const input = document.createElement("input");
                vnode.dom.appendChild(input);

                this.endDatePicker = new pikaday({
                  defaultDate: this.endDate,
                  setDefaultDate: true,
                  field: input,
                  onSelect: function() {
                    self.endDate = this.getDate();
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
              onchange: ev => {
                if (ev.target) {
                  this.reportName = ev.target.value;
                }
              }
            },
            Object.keys(types).map(key => {
              return m(
                "option",
                {
                  value: key,
                  selected: key === this.reportName
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
              disabled: this.executing,
              onclick: this.run
            },
            this.executing ? t("Executing...") : t("Run!")
          )
        ),

        m(".row.col-md-12", [
          this.result.query && this.result.query.reportid === "idle"
            ? m(idle, {
                result: this.result
              })
            : "",

          this.result.query && this.result.query.reportid === "daily"
            ? m(daily, {
                result: this.result
              })
            : "",

          this.result.query && this.result.query.reportid === "mileage"
            ? m(mileage, {
                result: this.result
              })
            : "",

          this.result.query && this.result.query.reportid === "odometer"
            ? m(odometer, {
                result: this.result
              })
            : "",

          this.result.query && this.result.query.reportid === "speed"
            ? m(speed, {
                result: this.result
              })
            : "",

          this.result.query && this.result.query.reportid === "ignition"
            ? m(ignition, {
                result: this.result
              })
            : "",

          this.result.query && this.result.query.reportid === "start"
            ? m(start, {
                result: this.result
              })
            : "",

          this.result.query && this.result.query.reportid === "summary"
            ? m(summary, {
                result: this.result
              })
            : "",

          this.result.query && this.result.query.reportid === "obd"
            ? m(obd, {
                result: this.result
              })
            : "",

          this.result.query && this.result.query.reportid === "jes"
            ? m(jes, {
                result: this.result
              })
            : "",
          // ,m('div.business-table', [
          // 	m('pre', JSON.stringify(this.result, undefined, 4))
          // ])

          this.error
            ? m("div.business-table", [
                m("pre", JSON.stringify(this.error, undefined, 4))
              ])
            : null
        ])
      ])
    )
  ]);
};
