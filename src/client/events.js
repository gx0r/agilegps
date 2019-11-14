/* Copyright (c) 2016 Grant Miner */
"use strict";
const t = require("./i18n").translate;
const m = require("mithril");
const appState = require("./appState");
const _ = require("lodash");
const moment = require("moment");

const eventreportparser = require("../helper/eventreportparser");
const modal = require("mithril-modal");

const catchhandler = require("./catchhandler");

const Cookies = require("cookies-js");
const fullAddress = require("../common/addressdisplay").full;

module.exports.oninit = function() {
  this.parsed = {};

  this.page = function(page) {
    return appState.changePage(page);
  };

  this.pagesize = function(size) {
    return appState.changePageSize(size);
  };

  this.changePage = function(page) {
    return appState.changePage(page);
  };

  this.search = function(search) {
    return appState.changePageSearch(search);
  };

  this.nextPage = function() {
    const page = appState.getState().page;
    return appState.changePage(page + 1);
  };

  function geocode(id, force) {
    const headers = {
      "content-type": "application/json; charset=UTF-8"
    };
    if (Cookies.get("jwt")) {
      headers["authorization"] = "Bearer " + Cookies.get("jwt");
    }

    return fetch(
      "/api/vehiclehistory/" + id + "/geocode" + (force ? "?force=true" : ""),
      {
        method: "POST",
        headers
      }
    );
  }

  this.geocode = function(id, force) {
    return geocode(id, force)
      .then(function() {
        appState.updateEvents();
      })
      .catch(catchhandler);
  };

  this.geocodeAll = function() {
    const state = appState.getState();
    const events = state.events;

    Promise.map(
      events,
      function(event) {
        if (!event.ad) {
          return geocode(event.id, false);
        }
      },
      { concurrency: 1 }
    ).finally(function() {
      appState.updateEvents();
    });
  };
};

module.exports.view = function() {
  const state = appState.getState();
  const events = state.events;
  const count = state.eventCount;
  let keys = [];
  const type = _.lowerCase(state.view);
  const page = state.page;
  const pagesize = state.pagesize;

  if (events.length > 0) {
    keys = [];
    events.forEach(function(item) {
      keys = _.union(keys, Object.keys(item));
    });

    if (type === "events") {
      keys.unshift("Geocode");
    }
  }

  const buildPagination = () => {
    const pages = Math.ceil(count / pagesize);
    const lis = [];
    for (let i = 1; i < pages + 1; i++) {
      lis.push(
        m(
          "li",
          m(
            "a",
            {
              style: {
                cursor: "pointer"
              },
              onclick: ev => {
                if (ev.target) {
                  this.changePage(ev.target.value);
                }
              },
              value: i
            },
            i
          )
        )
      );
    }
    lis.push(
      m(
        "li",
        m(
          "a",
          {
            style: {
              cursor: "pointer"
            },
            onclick: this.nextPage
          },
          "»"
        )
      )
    );
    return m("nav", m("ul.pagination", lis));
  }

  return m("div.text-nowrap", [
    m(
      "label",
      t("Selected Page"),
      m("input.form-control", {
        type: "number",
        onchange: ev => {
          if (ev.target) {
            this.page(ev.target.value);
          }
        },
        value: page
      })
    ),

    m(
      "label",
      t("Count per Page"),
      m("input.form-control", {
        type: "number",
        onblur: ev => {
          if (ev.target) {
            this.pagesize(ev.target.value);
          }
        },
        value: pagesize
      })
    ),

    type === "rawevents"
      ? m(
          "label",
          t("Search by IMEI"),
          m("input.form-control", {
            type: "text",
            onchange: ev => {
              if (ev.target) {
                this.search(ev.target.value);
              }
            },
            value: state.search,
            onkeyup: ev => {
              if (ev.keyCode === 13) {
                appState.updateEvents();
              } else {
                ev.redraw = false;
              }
            }
          })
        )
      : null,

    m(
      "button.btn btn-success",
      {
        onclick: () => {
          appState.updateEvents();
        }
      },
      t("Refresh")
    ),

    buildPagination(),

    type === "events"
      ? m(
          "div",
          "Legend: a = azimuth, b = buffered, bp = battery percentage, d = date sent by the unit, faketow = maybe about to be towing, g = gps accuracy (1=most accurate/20=least/0=unknown or not reported), " +
            "gss = gpsSignalStatus report (1 seeing, 0 not seeing), satelliteNumber = number of GPS satellites seeing, h = engine hours, ig = ignition, igd = ignition duration, m = distance (kilometers), mo = motion, p = powervcc, rid = report id, rty = report type, s = speed (kph)"
        )
      : null,

    type === "events"
      ? m(
          "button.btn-xs",
          {
            onclick: ev => {
              this.geocodeAll();
            }
          },
          t("Cached geocode visible with missing")
        )
      : null,
    m("br"),
    // m('nav', m('ul.pagination', [
    //     m('li', m('a', {
    //         onclick: m.withAttr('value', this.changePage),
    //         value: '1'
    //     }, '1')),
    // ])),
    m("div", count + " " + type),

    m(modal, {
      animation: "fadeAndScale",
      style: {
        dialog: {
          // backgroundColor: '#aaffee',
          width: "600px"
        }
      },
      close: "✘",
      inner: m({
        view: () => {
          return m(
            "div",
            m(
              "pre",
              _.isObject(this.parsed)
                ? JSON.stringify(this.parsed, null, 4)
                : this.parsed
            )
          );
        }
      })
    }),

    m("table.table-condensed table-bordered table-striped", [
      m(
        "thead",
        keys.map(key => m("td", key)),
      ),
      type === "rawevents" || type === "events"
        ? m(
            "tbody",
            events.map(event => {
              return m("tr", [
                keys.map(key => {
                  if (key === "message") {
                    const msg = event[key];

                    return m(
                      "td",
                      m(
                        "button.btn btn-xs btn-default",
                        {
                          onclick: () => {
                            modal.show();
                            let parsed;
                            try {
                              parsed = eventreportparser(msg);
                              delete parsed.args;
                              this.parsed = parsed;
                            } catch (e) {
                              parsed = e;
                              if (e.stack) {
                                this.parsed = e.stack;
                              } else {
                                this.parsed = e.message;
                              }
                            }
                            // alert(JSON.stringify(parsed, null, 4));
                          }
                        },
                        t("Parse")
                      ),
                      " " + msg
                    );
                  }
                  if (key === "ad") {
                    if (event[key]) {
                      let obj = event[key];
                      let str = JSON.stringify(obj, null, 2);
                      return m(
                        "pre.pointer",
                        {
                          onclick: ev => {
                            ev.target.innerHTML = str;
                          }
                        },
                        fullAddress(event) + "…"
                      );
                    }
                  }
                  if (key === "d" || key === "date") {
                    try {
                      return m(
                        "td",
                        moment(event[key]).format("M/DD/YYYY h:mm:ss A")
                      );
                    } catch (e) {
                      console.warn(e);
                      return m("td", event[key]);
                    }
                  } else if (key === "Geocode") {
                    return [
                      m(
                        "button.button btn-xs",
                        {
                          onclick: ev => {
                            this.geocode(event.id, false);
                          }
                        },
                        t("Cached")
                      ),
                      " ",
                      m(
                        "button.button btn-xs",
                        {
                          onclick: ev => {
                            this.geocode(event.id, true);
                          }
                        },
                        t("Force")
                      )
                    ];
                  } else {
                    return m("td", event[key]);
                  }
                })
              ]);
            })
          )
        : null,

      type === "exceptions"
        ? m(
            "tbody",
            events.map(event => {
              return m(
                "tr",
                keys.map(key => {
                  if (key === "date") {
                    try {
                      return m(
                        "td",
                        moment(event[key]).format("M/DD/YYYY h:mm:ss.SSS A")
                      );
                    } catch (e) {
                      console.warn(e);
                      return m("td", event[key]);
                    }
                  } else {
                    return m(
                      "td",
                      m(
                        "pre",
                        key !== "stack" && _.isObject(event[key])
                          ? JSON.stringify(event[key], null, 4)
                          : event[key]
                      )
                    );
                  }
                })
              );
            })
          )
        : null
    ])
  ]);
};
