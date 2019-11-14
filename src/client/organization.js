/* Copyright (c) 2016 Grant Miner */
"use strict";
const t = require("./i18n").translate;

const m = require("mithril");
const _ = require("lodash");
const navbar = require("./navbar");
const users = require("./users");
const Status = require("../common/status");
const todir = require("../common/todir");
const helpers = require("../common/helpers");
const tzOffset = require("./tzoffset");
const tomiles = require("./tomiles");
const hidenan = require("../common/hidenan");
const toGoogle = require("./togoogle");
const sorts = require("./sorts");
const reports = require("./reports/reports");
const street = require("../common/addressdisplay").street;
const city = require("../common/addressdisplay").city;
const stateFormat = require("../common/addressdisplay").state;
const appState = require("./appState");
const OrgMarkers = require("./markers/OrgMarkers");
const ClickListenerFactory = require("./markers/clicklistenerfactory");
const formatDate = require("./formatDate");
const isUserMetric = require("./isUserMetric");

module.exports.oninit = function(vnode) {
  // vnode.state.selectedItem = {};
};

module.exports.view = function(vnode) {
  const state = appState.getState();
  if (!vnode.selectedItem) {
    vnode.selectedItem = {};
  }

  function clickItem(item) {
    if (vnode.selectedItem === item) {
      vnode.selectedItem = {};
      ClickListenerFactory.closeInfoWindow();
    } else {
      vnode.selectedItem = item;
      OrgMarkers.clickMarkerByVehicleID(item.id);
    }
  };

  const advancedUI = state.user.advancedMode;

  let refreshLater = null;
  const RECENTLY_CHANGED = 10000; /// was updated 10 seconds ago
  function wasRecentlyUpdated(date) {
    date = new Date(date);
    const lastUpdated = new Date() - date < RECENTLY_CHANGED;
    if (lastUpdated && refreshLater == null) {
      refreshLater = Promise.delay(RECENTLY_CHANGED).then(function() {
        // queue a redraw for later to remove highlights from recently updated history items.
        m.redraw();
      });
    }
    return lastUpdated;
  }

  return m(".business-table", [
    // m('button.btn btn-primary btn-xs btn-pad', {
    // 	onclick: function () {
    // 		appState.update();
    // 	}
    // }, 'Update'),
    // ' ',
    m(
      "label",
      {
        style: {
          "margin-right": ".5em"
        }
      },
      m("input[type=checkbox]", {
        // checked: ctrl.autoUpdate(),
        checked: state.autoUpdate,
        onclick: function() {
          appState.setAutoUpdate(this.checked);
        }
      }),
      t("Auto Update Map")
    ),
    " ",
    //
    // m('span', 'Last event: '),
    // m('span.padrt.updated-border', (!state.lastUpdated ? '' : moment(state.lastUpdated).format('h:mm:ss A'))),

    m(
      "label.padrt",
      m("input[type=checkbox]", {
        onclick: function() {
          appState.setShowVerbose(this.checked);
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

    m(
      "a.padrt",
      {
        href:
          "/api/organizations/" +
          state.selectedOrg.id +
          "/vehiclestatus?format=excel" +
          "&latlong=" +
          state.showLatLong +
          "&verbose=" +
          state.verbose +
          "&tzOffset=" +
          encodeURIComponent(tzOffset()),
        style: {
          cursor: "pointer"
        },
      },
      m("img", {
        src: "images/excel-icon.png"
      }),
      " " + t("Excel")
    ),

    m("br"),
    m("label", "Total: " + state.impliedSelectedVehicles.length),
    m(
      "table.table.table-bordered.table-striped",
      sorts(state.impliedSelectedVehicles),
      [
        m(
          "thead",
          {
            style: {
              cursor: "pointer"
            }
          },
          [
            m("td[data-sort-by=name]", t("Name")),
            m("td[data-sort-by=last.d]", t("Date")),
            m("td", t("Address")),
            m("td", t("City")),
            m("td", t("State")),
            !state.verbose ? "" : m("td[data-sort-by=last.m]", t("Odometer")),
            !state.verbose ? "" : m("td[data-sort-by=last.h]", t("Hour Meter")),
            m("td[data-sort-by=azimuth(last)]", t("Dir")),
            m("td[data-sort-by=last.s]", isUserMetric() ? t("km/h") : t("mph")),
            state.showLatLong ? m("td[data-sort-by=last.la]", t("Lat")) : "",
            state.showLatLong ? m("td[data-sort-by=last.lo]", t("Long")) : "",
            m("td[data-sort-by=Status.getStatus(last)]", t("Status")),
            !state.verbose ? "" : m("td[data-sort-by=last.b]", t("Online")),
            !state.verbose ? "" : m("td[data-sort-by=last.bp]", t("Battery")),
            m("td[data-sort-by=last.g]", t("GPS"))
          ]
        ),
        m(
          "tbody",
          {
            style: {
              cursor: "pointer"
            }
          },

          state.impliedSelectedVehicles.map(function(vehicle) {
            if (!vehicle) {
              throw new TypeError("Null vehicle");
            }

            let lastStatus;
            if (state.verbose) {
              if (vehicle.lastVerbose && vehicle.last) {
                if (
                  new Date(vehicle.lastVerbose.d) >= new Date(vehicle.last.d)
                ) {
                  lastStatus = vehicle.lastVerbose;
                } else {
                  lastStatus = vehicle.last;
                }
              } else if (vehicle.lastVerbose) {
                lastStatus = vehicle.lastVerbose;
              } else if (vehicle.last) {
                lastStatus = vehicle.last;
              }
            } else if (vehicle.last) {
              lastStatus = helpers.cleanItem(vehicle.last);
            }

            if (!lastStatus) {
              return m("tr", [m("td.nowrap", vehicle.name)]);
            }

            return m(
              "tr",
              {
                id: vehicle.id,
                // key: vehicle.id, // TODO fixme
                onclick: function(ev) {
                  clickItem(vehicle);
                },
                style: {
                  transition: wasRecentlyUpdated(lastStatus.d)
                    ? "background-color 1s ease-in-out"
                    : "none",
                  "background-color":
                    vehicle.id === vnode.selectedItem.id
                      ? "#FEE0C6"
                      : wasRecentlyUpdated(lastStatus.d)
                      ? "yellow"
                      : ""
                }
              },
              [
                m("td.nowrap", vehicle.name),
                m("td.nowrap", lastStatus.d ? formatDate(lastStatus.d) : ""),
                m("td.nowrap", street(lastStatus)),
                m("td.nowrap", city(lastStatus)),
                m("td.nowrap", stateFormat(lastStatus)),
                !state.verbose
                  ? ""
                  : m("td.nowrap", hidenan(tomiles(lastStatus.m))),
                !state.verbose ? "" : m("td.nowrap", lastStatus.h),
                m("td.nowrap", todir(lastStatus)),
                m("td.nowrap", hidenan(tomiles(lastStatus.s))),
                state.showLatLong ? m("td.nowrap", lastStatus.la) : "",
                state.showLatLong ? m("td.nowrap", lastStatus.lo) : "",
                m(
                  "td.nowrap",
                  {
                    style: {
                      color: Status.getStatusColor(lastStatus)
                    }
                  },
                  t(Status.getStatus(lastStatus))
                ),
                !state.verbose
                  ? ""
                  : m("td.nowrap", lastStatus.b ? t("Buffered") : t("Yes")),
                !state.verbose
                  ? ""
                  : m("td.nowrap", lastStatus.bp ? lastStatus.bp + "%" : ""),
                m("td.nowrap", m("img", {
                  src: helpers.getAccuracyAsImg(lastStatus.g)
                }))
              ]
            );
          })
        )
      ]
    )
  ]);
};
