/* Copyright (c) 2016 Grant Miner */
"use strict";
const t = require("./i18n").translate;
const m = require("mithril");
const appState = require("./appState");
const catchhandler = require("./catchhandler");
const navbar = require("./navbar");
const users = require("./users");
const Status = require("../common/status");
const helpers = require("../common/helpers");
const tzOffset = require("./tzoffset");
const tomiles = require("./tomiles");
const hidenan = require("../common/hidenan");
const toGoogle = require("./togoogle");
const moment = require("moment");
const pikaday = require("pikaday2").default;
const tohhmmss = require("../common/tohhmmss");
const street = require("../common/addressdisplay").street;
const city = require("../common/addressdisplay").city;
const renderState = require("../common/addressdisplay").state;
const milesfield = require("../common/milesfield");
const _ = require("lodash");
const animation = require("./markers/vehicleanimation");
const ClickListenerFactory = require("./markers/clicklistenerfactory");
const j2c = require("j2c");
const todir = require("../common/todir");
const isUserMetric = require("./isUserMetric");
const formatDate = require("./formatDate");

module.exports.oninit = function(vnode) {
  const state = appState.getState();

  this.rollup = true;
  this.highlightIgnition = false;
  this.highlightStarts = false;
  this.reverseOrder = false;
  this.rawData = false;
  this.vehiclehistory = [];
  this.adjustedVehicleHistory = [];
  this.speed = 0;
  this.selecteditem = {};
  this.startDate = new Date();
  this.endDate = new Date();
  this.firstRowClicked = false;

  if (state.startDate) {
    this.startDate = new Date(state.startDate);
  }

  if (state.endDate) {
    this.endDate = new Date(state.endDate);
  }

  this.selectDays = function() {
    const state = appState.getState();
    // if (this.startDate != state.startDate) {
    appState.selectDays(
      this.startDate,
      moment(this.endDate)
        .add(1, "day")
        .toDate()
    );
    // }
  };

  this.updated = null;
  this.calculateDistanceBetween = "start";

  animation.controller(this);
  this.progressElem = animation.progress;

  this.clickItem = item => {
    if (this.selecteditem === item) {
      this.selecteditem = {};
      ClickListenerFactory.closeInfoWindow();
    } else {
      this.selecteditem = item;
      animation.clickMarkerByID(item.id);
    }
  };

  this.play = animation.play;
  this.pause = animation.pause;
  this.stop = animation.stop;
  this.isPausable = animation.isPausable;
  this.isPlayable = animation.isPlayable;
  this.isStoppable = animation.isStoppable;

  this.speedChange = ev => {
    const val = parseInt(ev.target.value, 10);
    switch (val) {
      case 0:
        animation.setSpeed(400);
        break;
      case 1:
        animation.setSpeed(250);
        break;
      case 2:
        animation.setSpeed(100);
        break;
      case 3:
        animation.setSpeed(50);
        break;
      case 4:
        animation.setSpeed(35);
        break;
      case 5:
        animation.setSpeed(20);
        break;
      case 6:
        animation.setSpeed(15);
        break;
      case 7:
        animation.setSpeed(10);
        break;
      case 8:
        animation.setSpeed(5);
        break;
      case 9:
        animation.setSpeed(1);
        break;
      default:
        animation.setSpeed(0);
        break;
    }
  };
  animation.setSpeed(1);

  this.recalculateAdjustedVehicleHistory = () => {
    const state = appState.getState();
    const vehicle = state.selectedVehicle;
    const hist = state.selectedVehicleHistory;
    this.vehiclehistory = hist;
    let res = _.cloneDeep(state.selectedVehicleHistory);

    if (this.rawData) {
      if (this.rollup) {
        res = helpers.rollup(res);
      }
      if (!this.reverseOrder) {
        res.reverse();
      }
    } else {
      if (!state.verbose) {
        res = res.filter(helpers.isNotVerbose);
      }

      res = helpers.cleanData(res);
      res = helpers.mileageChange(res);

      if (this.rollup) {
        res = helpers.rollup(res);
      }
      res = helpers.addStartStop(res);

      if (this.calculateDistanceBetween === "start") {
        res = helpers.startStopMileage(res);
      } else {
        res = helpers.ignitionMileage(res);
      }

      if (!this.reverseOrder) {
        res.reverse();
      }
    }

    this.adjustedVehicleHistory = res;
  };

  this.recalculateAdjustedVehicleHistory();

  this.previouslySelectedVehicle = null;

  appState.getStore().subscribe(() => {
    const state = appState.getState();
    if (state.selectedVehicle != this.previouslySelectedVehicle) {
      this.firstRowClicked = false;
      this.previouslySelectedVehicle = state.selectedVehicle;
    }

    this.startDate = new Date(state.startDate);
    this.endDate = new Date(state.endDate);

    // this.startDatePicker.setDate(state.startDate);
    // this.endDatePicker.setDate(state.endDate);

    this.recalculateAdjustedVehicleHistory();
    m.redraw();
  });

  const root = require("./root");
  this.animationConfig = vnode =>  {
    // relocate the animation controls when the map gets big/small
    const mapEl = root.getMapElement();
    if (mapEl) {
      const cur = vnode.dom.getBoundingClientRect();
      const r = mapEl.getBoundingClientRect();
      vnode.dom.style.position = "absolute";
      vnode.dom.style.top = r.height - cur.height - 30 + "px";
    }
  };
};

module.exports.view = function(vnode) {
  const state = appState.getState();
  const advancedUI = state.user.advancedMode;

  return m("div", [
    m(".business-table", [
      m(
        "div",
        advancedUI
          ? null
          : [
              m("span", t("Select Day") + " "),
              m("span.padrt", {
                oncreate: vnode => {
                  const input = document.createElement("input");
                  vnode.dom.appendChild(input);

                  this.startDatePicker = new pikaday({
                    defaultDate: this.startDate,
                    setDefaultDate: true,
                    field: input,
                    onSelect: () => {
                      this.startDate = this.getDate();
                      this.endDate = this.getDate();
                      this.selectDays();
                    }
                  });
                }
              })
            ],
        m(
          "button.btn btn-xs btn-primary btn-pad",
          {
            onclick: () => {
              this.firstRowClicked = false;
              appState.update();
            }
          },
          t("Refresh")
        ),
        " ",
        // m('span', 'Updated: '),
        // m('span.padrt.updated-border', (!state.lastUpdated ? '' : moment(state.lastUpdated).format('h:mm:ss A'))),
        // ' ',
        m(
          "a",
          {
            href:
              "/api/organizations/" +
              state.selectedOrg.id +
              "/vehiclehistory/" +
              state.selectedVehicle.id +
              "?format=excel" +
              "&latlong=" +
              state.showLatLong +
              "&rollupStationaryEvents=" +
              this.rollup +
              "&verbose=" +
              (state.verbose ? "true" : "false") +
              "&startDate=" +
              encodeURIComponent(this.startDate.toISOString()) +
              "&endDate=" +
              encodeURIComponent(
                moment(this.endDate)
                  .add(1, "day")
                  .toISOString()
              ) +
              "&calculateDistanceBetween=" +
              this.calculateDistanceBetween +
              "&reverse=" +
              (this.reverseOrder ? "true" : "false") +
              "&tzOffset=" +
              encodeURIComponent(tzOffset()),
            style: {
              cursor: "pointer",
              "margin-left": "1em"
            }
          },
          m("img", {
            src: "images/excel-icon.png"
          }),
          " " + t("Excel")
        ),

        m(
          "div",
          {
            oncreate: vnode => this.animationConfig(vnode),
            style: {
              "background-color": "rgb(221, 221, 221)"
            }
          },
          [
            m("button.btn btn-xs btn-success glyphicon glyphicon-play", {
              onclick: this.play,
              disabled: !this.isPlayable()
            }),
            " ",
            m("button.btn btn-xs btn-warning glyphicon glyphicon-pause", {
              onclick: this.pause,
              disabled: !this.isPausable()
            }),
            " ",
            m("button.btn btn-xs btn-danger glyphicon glyphicon-stop", {
              onclick: this.stop,
              disabled: !this.isStoppable()
            }),
            m("progress", {
              value: 0,
              style: {
                "margin-left": "1em"
              },
              oncreate: vnode => this.progressElem = vnode.dom
            }),
            m("input[type=range]", {
              min: 0,
              max: 10,
              onchange: this.speedChange,
              oncreate: vnode => vnode.dom.value = 9,
            })
          ]
        ),
        !advancedUI
          ? null
          : [
              m("label", t("Showing:")),
              m("div", {
                oncreate: vnode => {
                  const input = document.createElement("input");
                  vnode.dom.appendChild(input);

                  this.startDatePicker = new pikaday({
                    defaultDate: this.startDate,
                    setDefaultDate: true,
                    field: input,
                    onSelect: function() {
                      this.startDate = this.getDate();
                      this.selectDays();
                    }
                  });
                }
              }),
              m("label", t("Through the end of:")),
              m("div", {
                oncreate: vnode => {
                  const input = document.createElement("input");
                  vnode.dom.appendChild(input);

                  this.endDatePicker = new pikaday({
                    defaultDate: this.endDate,
                    setDefaultDate: true,
                    field: input,
                    onSelect: () => {
                      this.endDate = this.getDate();
                      this.selectDays();
                    }
                  });
                }
              })
            ],
        !advancedUI
          ? null
          : m(
              "form.nowrap",
              {
                style: {
                  display: "inline"
                }
              },
              [
                m("br"),
                m("label", t("Calculate distances between: ")),
                m(
                  "label",
                  {
                    style: {
                      "margin-left": "0.5em"
                    }
                  },
                  m("input[type=radio][name=speed]", {
                    checked: this.calculateDistanceBetween === "ignition",
                    onchange: function(a) {
                      this.calculateDistanceBetween = "ignition";
                      this.recalculateAdjustedVehicleHistory();
                    },
                    value: "ignition"
                  }),
                  t("Ignition")
                ),

                m(
                  "label",
                  {
                    style: {
                      "margin-left": "0.5em"
                    }
                  },
                  m("input[type=radio][name=speed]", {
                    checked: this.calculateDistanceBetween === "start",
                    onchange: function(ev) {
                      this.calculateDistanceBetween = "start";
                      this.recalculateAdjustedVehicleHistory();
                    },
                    value: "start"
                  }),
                  t("Start/Stop")
                )
              ]
            ),
        m("br"),
        m(".nowrap", [
          m(
            "label.padrt",
            m("input[type=checkbox]", {
              onclick: function() {
                this.highlightStarts = this.checked;
              },
              checked: this.highlightStarts
            }),
            t("Highlight starts")
          ),

          !advancedUI
            ? null
            : m(
                "label.padrt",
                m("input[type=checkbox]", {
                  onclick: function() {
                    this.highlightIgnition = this.checked;
                  },
                  checked: this.highlightIgnition
                }),
                t("Highlight ignition")
              ),

          m(
            "label.padrt",
            m("input[type=checkbox]", {
              onclick: function() {
                this.reverseOrder = this.checked;
                this.recalculateAdjustedVehicleHistory();
              },
              checked: this.reverseOrder
            }),
            t("Reverse Order")
          ),

          m(
            "label.padrt",
            m("input[type=checkbox]", {
              onclick: function() {
                appState.setShowVerbose(this.checked);
                this.recalculateAdjustedVehicleHistory();
              },
              checked: state.verbose
            }),
            t("Verbose")
          ),

          m(
            "label.padrt",
            m("input[type=checkbox]", {
              onclick: function() {
                appState.setShowLatLong(this.checked);
              },
              checked: state.showLatLong
            }),
            t("LAT/LONG")
          ),

          state.user.isAdmin || advancedUI
            ? m(
                "label.padrt",
                m("input[type=checkbox]", {
                  onclick: function() {
                    this.rollup = this.checked;
                    this.recalculateAdjustedVehicleHistory();
                  },
                  checked: this.rollup
                }),
                t("Rollup idling & parked")
              )
            : null,

          state.user.isAdmin
            ? [
                m(
                  "label",
                  m("input[type=checkbox]", {
                    onclick: function() {
                      this.rawData = this.checked;
                      this.recalculateAdjustedVehicleHistory();
                    },
                    checked: this.rawData
                  }),
                  t("Raw")
                ),
                m("br")
              ]
            : null
        ]),

        !advancedUI
          ? null
          : m(
              "label",
              "Showing " +
                this.adjustedVehicleHistory.length +
                (this.vehiclehistory.length === 1 ? " event" : " events") +
                (this.vehiclehistory.length === 0
                  ? " (Try a different date range?)"
                  : "")
            ),
        m(
          "table.table table-bordered table-striped",
          {
            style: {
              cursor: "pointer"
            }
          },
          [
            m("thead", [
              m("td", t("Date")),
              m("td", t("Address")),
              m("td", t("City")),
              m("td", t("State")),
              m("td", isUserMetric() ? t("Kilometers") : t("Miles")),
              state.verbose ? m("td", t("Odometer")) : "",
              state.verbose ? m("td", t("Engine Hours")) : "",
              m("td", t("Dir")),
              m("td", isUserMetric() ? t("km/h") : t("mph")),
              state.showLatLong ? m("td", t("Lat")) : "",
              state.showLatLong ? m("td", t("Long")) : "",
              m("td", t("Status")),
              state.verbose ? m("td", t("Online")) : "",
              state.verbose ? m("td", t("Battery %")) : "",
              m("td", t("GPS")),
              this.rawData ? m("td", t("Raw")) : null
            ]),
            m(
              "tbody",
              this.adjustedVehicleHistory.length < 1
                ? m("div", t("No vehicle history for this day"))
                : this.adjustedVehicleHistory.map(item  => {
                    return m(
                      "tr",
                      {
                        oncreate: vnode => {
                          if (
                            !this.firstRowClicked &&
                            item.la != null &&
                            item.lo != null
                          ) {
                            this.firstRowClicked = true;
                            setTimeout(() => {
                              vnode.dom.click();
                              this.firstRowClicked = true;
                            }, 0);
                          }
                        },
                        class:
                          (this.highlightIgnition && item.cmd === "IGN") ||
                          (this.highlightStarts &&
                            item.statusOverride === "Start")
                            ? "highlight-igniton"
                            : "",
                        onclick: () => {
                          this.clickItem(item);
                        },
                        key: item.id,
                        style: j2c.inline({
                          "background-color":
                            item.id === this.selecteditem.id ? "#FEE0C6" : ""
                        })
                      },
                      [
                        m("td", formatDate(item.d)),
                        m("td", street(item)),
                        m("td", city(item)),
                        m("td", renderState(item)),
                        m(
                          "td",
                          {
                            style: j2c.inline({
                              color:
                                item.idleTime != null
                                  ? Status.getStatusColor(item)
                                  : ""
                            })
                          },
                          milesfield(item, isUserMetric())
                        ),
                        state.verbose ? m("td", hidenan(tomiles(item.m))) : "", // total mileage
                        state.verbose ? m("td", item.h) : "",
                        m("td", todir(item)),
                        m("td", hidenan(tomiles(item.s))),
                        state.showLatLong ? m("td", item.la) : "",
                        state.showLatLong ? m("td", item.lo) : "",
                        this.rawData
                          ? m(
                              "td",
                              {
                                style: j2c.inline({
                                  color: Status.getStatusColor(item)
                                })
                              },
                              item.cmd + " " + Status.getStatus(item)
                            )
                          : m(
                              "td",
                              {
                                style: j2c.inline({
                                  color: Status.getStatusColor(item)
                                })
                              },
                              t(Status.getStatus(item))
                            ),
                        state.verbose
                          ? m("td", item.b ? t("Buffered") : t("Yes"))
                          : "",
                        state.verbose ? m("td", item.bp) : "",
                        m("td", m("img", {
                          src: helpers.getAccuracyAsImg(item.g)
                        })),
                        this.rawData
                          ? m(
                              "td",
                              m(
                                "pre",
                                {
                                  // if you click the raw message, reformat it nicely
                                  onclick: function(el) {
                                    el.target.innerText = JSON.stringify(
                                      item,
                                      null,
                                      4
                                    );
                                  }
                                },
                                JSON.stringify(item)
                              )
                            )
                          : null
                      ]
                    );
                  })
            )
          ]
        )
      )
    ])
  ]);
};
