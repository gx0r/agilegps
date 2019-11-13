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

module.exports.controller = function(args, extras) {
  const ctrl = this;
  const state = appState.getState();

  ctrl.rollup = true;
  ctrl.highlightIgnition = false;
  ctrl.highlightStarts = false;
  ctrl.reverseOrder = false;
  ctrl.rawData = false;
  ctrl.vehiclehistory = [];
  ctrl.adjustedVehicleHistory = [];
  ctrl.speed = 0;
  ctrl.selecteditem = {};
  ctrl.startDate = null;
  ctrl.endDate = null;
  ctrl.firstRowClicked = false;

  if (state.startDate) {
    ctrl.startDate = new Date(state.startDate);
  }

  if (state.endDate) {
    ctrl.endDate = new Date(state.endDate);
  }

  ctrl.selectDays = function() {
    const state = appState.getState();
    // if (ctrl.startDate != state.startDate) {
    appState.selectDays(
      ctrl.startDate,
      moment(ctrl.endDate)
        .add(1, "day")
        .toDate()
    );
    // }
  };

  ctrl.updated = null;
  ctrl.calculateDistanceBetween = "start";

  animation.controller(this);
  ctrl.progressElem = animation.progress;

  ctrl.clickItem = function(item) {
    if (ctrl.selecteditem === item) {
      ctrl.selecteditem = {};
      ClickListenerFactory.closeInfoWindow();
    } else {
      ctrl.selecteditem = item;
      animation.clickMarkerByID(item.id);
    }
  };

  ctrl.play = animation.play;
  ctrl.pause = animation.pause;
  ctrl.stop = animation.stop;
  ctrl.isPausable = animation.isPausable;
  ctrl.isPlayable = animation.isPlayable;
  ctrl.isStoppable = animation.isStoppable;

  ctrl.speedChange = function(ev) {
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

  ctrl.recalculateAdjustedVehicleHistory = function recalculateAdjustedVehicleHistory() {
    const state = appState.getState();
    const vehicle = state.selectedVehicle;
    const hist = state.selectedVehicleHistory;
    ctrl.vehiclehistory = hist;
    let res = _.cloneDeep(state.selectedVehicleHistory);

    if (ctrl.rawData) {
      if (ctrl.rollup) {
        res = helpers.rollup(res);
      }
      if (!ctrl.reverseOrder) {
        res.reverse();
      }
    } else {
      if (!state.verbose) {
        res = res.filter(helpers.isNotVerbose);
      }

      res = helpers.cleanData(res);
      res = helpers.mileageChange(res);

      if (ctrl.rollup) {
        res = helpers.rollup(res);
      }
      res = helpers.addStartStop(res);

      if (ctrl.calculateDistanceBetween === "start") {
        res = helpers.startStopMileage(res);
      } else {
        res = helpers.ignitionMileage(res);
      }

      if (!ctrl.reverseOrder) {
        res.reverse();
      }
    }

    ctrl.adjustedVehicleHistory = res;
  };

  ctrl.recalculateAdjustedVehicleHistory();

  ctrl.previouslySelectedVehicle = null;

  appState.getStore().subscribe(function() {
    const state = appState.getState();
    if (state.selectedVehicle != ctrl.previouslySelectedVehicle) {
      ctrl.firstRowClicked = false;
      ctrl.previouslySelectedVehicle = state.selectedVehicle;
    }

    ctrl.startDate = new Date(state.startDate);
    ctrl.endDate = new Date(state.endDate);

    // ctrl.startDatePicker.setDate(state.startDate);
    // ctrl.endDatePicker.setDate(state.endDate);

    ctrl.recalculateAdjustedVehicleHistory();
    m.redraw();
  });

  const root = require("./root");
  ctrl.animationConfig = function(el, isInitialized) {
    // relocate the animation controls when the map gets big/small
    const mapEl = root.getMapElement();
    if (mapEl) {
      const cur = el.getBoundingClientRect();
      const r = mapEl.getBoundingClientRect();
      el.style.position = "absolute";
      el.style.top = r.height - cur.height - 30 + "px";
    }
  };
};

module.exports.view = function(ctrl, args, extras) {
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
                config: function(el, isInitialized) {
                  if (isInitialized) return;
                  const input = document.createElement("input");
                  el.appendChild(input);

                  ctrl.startDatePicker = new pikaday({
                    defaultDate: ctrl.startDate,
                    setDefaultDate: true,
                    field: input,
                    onSelect: function() {
                      ctrl.startDate = this.getDate();
                      ctrl.endDate = this.getDate();
                      ctrl.selectDays();
                    }
                  });
                }
              })
            ],
        m(
          "button.btn btn-xs btn-primary btn-pad",
          {
            onclick: function() {
              ctrl.firstRowClicked = false;
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
              ctrl.rollup +
              "&verbose=" +
              (state.verbose ? "true" : "false") +
              "&startDate=" +
              encodeURIComponent(ctrl.startDate.toISOString()) +
              "&endDate=" +
              encodeURIComponent(
                moment(ctrl.endDate)
                  .add(1, "day")
                  .toISOString()
              ) +
              "&calculateDistanceBetween=" +
              ctrl.calculateDistanceBetween +
              "&reverse=" +
              (ctrl.reverseOrder ? "true" : "false") +
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
            config: ctrl.animationConfig,
            style: {
              "background-color": "rgb(221, 221, 221)"
            }
          },
          [
            m("button.btn btn-xs btn-success glyphicon glyphicon-play", {
              onclick: ctrl.play,
              disabled: !ctrl.isPlayable()
            }),
            " ",
            m("button.btn btn-xs btn-warning glyphicon glyphicon-pause", {
              onclick: ctrl.pause,
              disabled: !ctrl.isPausable()
            }),
            " ",
            m("button.btn btn-xs btn-danger glyphicon glyphicon-stop", {
              onclick: ctrl.stop,
              disabled: !ctrl.isStoppable()
            }),
            m("progress", {
              value: 0,
              style: {
                "margin-left": "1em"
              },
              config: ctrl.progressElem
            }),
            m("input[type=range]", {
              min: 0,
              max: 10,
              onchange: ctrl.speedChange,
              config: function(el, isInitialized) {
                if (!isInitialized) {
                  el.value = 9;
                }
              }
            })
          ]
        ),
        !advancedUI
          ? null
          : [
              m("label", t("Showing:")),
              m("div", {
                config: function(el, isInitialized) {
                  if (isInitialized) return;
                  const input = document.createElement("input");
                  el.appendChild(input);

                  ctrl.startDatePicker = new pikaday({
                    defaultDate: ctrl.startDate,
                    setDefaultDate: true,
                    field: input,
                    onSelect: function() {
                      ctrl.startDate = this.getDate();
                      ctrl.selectDays();
                    }
                  });
                }
              }),
              m("label", t("Through the end of:")),
              m("div", {
                config: function(el, isInitialized) {
                  if (isInitialized) return;
                  const input = document.createElement("input");
                  el.appendChild(input);

                  ctrl.endDatePicker = new pikaday({
                    defaultDate: ctrl.endDate,
                    setDefaultDate: true,
                    field: input,
                    onSelect: function() {
                      ctrl.endDate = this.getDate();
                      ctrl.selectDays();
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
                    checked: ctrl.calculateDistanceBetween === "ignition",
                    onchange: function(a) {
                      ctrl.calculateDistanceBetween = "ignition";
                      ctrl.recalculateAdjustedVehicleHistory();
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
                    checked: ctrl.calculateDistanceBetween === "start",
                    onchange: function(ev) {
                      ctrl.calculateDistanceBetween = "start";
                      ctrl.recalculateAdjustedVehicleHistory();
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
                ctrl.highlightStarts = this.checked;
              },
              checked: ctrl.highlightStarts
            }),
            t("Highlight starts")
          ),

          !advancedUI
            ? null
            : m(
                "label.padrt",
                m("input[type=checkbox]", {
                  onclick: function() {
                    ctrl.highlightIgnition = this.checked;
                  },
                  checked: ctrl.highlightIgnition
                }),
                t("Highlight ignition")
              ),

          m(
            "label.padrt",
            m("input[type=checkbox]", {
              onclick: function() {
                ctrl.reverseOrder = this.checked;
                ctrl.recalculateAdjustedVehicleHistory();
              },
              checked: ctrl.reverseOrder
            }),
            t("Reverse Order")
          ),

          m(
            "label.padrt",
            m("input[type=checkbox]", {
              onclick: function() {
                appState.setShowVerbose(this.checked);
                ctrl.recalculateAdjustedVehicleHistory();
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
                    ctrl.rollup = this.checked;
                    ctrl.recalculateAdjustedVehicleHistory();
                  },
                  checked: ctrl.rollup
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
                      ctrl.rawData = this.checked;
                      ctrl.recalculateAdjustedVehicleHistory();
                    },
                    checked: ctrl.rawData
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
                ctrl.adjustedVehicleHistory.length +
                (ctrl.vehiclehistory.length === 1 ? " event" : " events") +
                (ctrl.vehiclehistory.length === 0
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
              ctrl.rawData ? m("td", t("Raw")) : null
            ]),
            m(
              "tbody",
              ctrl.adjustedVehicleHistory().length < 1
                ? m("div", t("No vehicle history for this day"))
                : ctrl.adjustedVehicleHistory().map(function(item, index) {
                    return m(
                      "tr",
                      {
                        config: function(el, isInitialized) {
                          if (
                            !ctrl.firstRowClicked &&
                            item.la != null &&
                            item.lo != null
                          ) {
                            ctrl.firstRowClicked = true;
                            setTimeout(() => {
                              el.click();
                              ctrl.firstRowClicked = true;
                            }, 0);
                          }
                        },
                        class:
                          (ctrl.highlightIgnition() && item.cmd === "IGN") ||
                          (ctrl.highlightStarts() &&
                            item.statusOverride === "Start")
                            ? "highlight-igniton"
                            : "",
                        onclick: function(ev) {
                          ctrl.clickItem(item);
                        },
                        key: item.id,
                        style: j2c.inline({
                          "background-color":
                            item.id === ctrl.selecteditem().id ? "#FEE0C6" : ""
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
                        ctrl.rawData
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
                        m("td", helpers.getAccuracyAsImg(item.g)),
                        ctrl.rawData
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
