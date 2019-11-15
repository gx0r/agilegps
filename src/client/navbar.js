/* Copyright (c) 2016 Grant Miner */
"use strict";
const t = require("./i18n").translate;
const m = require("mithril");
const appState = require("./appState");
const moment = require("moment");
const xcloud = require("./svg/xcloud.js");
const isUserMetric = require("./isUserMetric");

module.exports.onunload = function() {
  document.body.removeEventListener('click', this.anywhereClick);
}

module.exports.oninit = function() {
  // manage dropdown
  this.manageOpen = false;
  // messages dropdown
  this.adminToolsOpen = false;
  this.anywhereClick = ev => {
    if (this.adminToolsOpen && !this.adminDropDownConfigEl.contains(ev.target)) {
      this.adminToolsOpen = false;
      m.redraw();
    }
    if (this.manageOpen && !this.manageDropDownEl.contains(ev.target)) {
      this.manageOpen = false;
      m.redraw();
    }
  }
  document.body.addEventListener('click', this.anywhereClick);
};

module.exports.view = function(vnode) {
  const state = appState.getState();
  const view = state.view;
  const subview = state.subview;

  function isAdmin() {
    return state.user.isAdmin;
  }

  function isLoggedIn() {
    return state.user.id != null;
  }

  function getLoginString() {
    const name = state.user.username;
    if (name != null) {
      return t("Logout", { name: name });
    } else {
      return t("Login");
    }
  }

  function getWelcomeText() {
    if (!!state.user.firstname) {
      return t("Welcome", { name: state.user.firstname });
    } else if (!!state.user.username) {
      return t("Welcome", { name: state.user.username });
    }
  }

  function getOrgName() {
    if (state.selectedOrg) {
      return state.selectedOrg.name;
    } else {
      return "";
    }
  }

  function orgPresent() {
    return state.selectedOrg && state.selectedOrg.id != null;
  }

  function lastUpdated() {
    if (!state.lastUpdated) {
      return "";
    }
    if (isUserMetric()) {
      return moment(state.lastUpdated).format("HH:mm:ss");
    } else {
      return moment(state.lastUpdated).format("h:mm:ss A");
    }
  }

  const noConnectivity = !state.realTimeUpdates && state.user.username;

  const svgW = 16;
  const svgH = 16;

  function getLogo() {
    return m("img[src=images/logosmall.png]");
  }

  // state.realTimeUpdates = false; // for testing network failure

  return m("div.container-fluid", [
    m("div.container-fluid", [
      m(
        "li",
        {
          style: {
            float: "left"
          }
        },
        getLogo()
      ),

      m(
        "li.nav navbar-right",
        {
          style: {
            "text-align": "right"
          }
        },
        [
          m("a", [
            m("br"),
            m("span.company-name", getOrgName()),
            m("br"),
            getWelcomeText()
          ]),
          m("br"),
          noConnectivity ? xcloud() : null,
          m(
            "a",
            {
              style: {
                color: noConnectivity ? "red" : ""
              }
            },
            (noConnectivity ? t("Connectivity lost") : "") +
              t("Last update") +
              " " +
              lastUpdated()
          )
        ]
      )
    ]),

    m("ul.nav navbar-nav", [
      !orgPresent()
        ? ""
        : m(
            "li",
            {
              class: subview === "REPORT" ? "active" : ""
            },
            m(
              "a",
              {
                href: "#",
                onclick: function(ev) {
                  ev.preventDefault();
                  appState.viewReports();
                }
              },
              require("./svg/report")(svgW, svgH),
              t("Reports")
            )
          ),

      !orgPresent()
        ? ""
        : m(
            "li.middle",
            {
              class: subview === "MAP" ? "active" : ""
            },
            m(
              "a",
              {
                href: "#",
                onclick: function(ev) {
                  ev.preventDefault();
                  appState.viewMap();
                }
              },
              require("./svg/map")(svgW, svgH),
              t("Map")
            )
          ),

      !orgPresent()
        ? ""
        : m(
            "li",
            {
              class: subview === "SPLIT" ? "active" : ""
            },
            m(
              "a",
              {
                href: "#",
                onclick: function(ev) {
                  ev.preventDefault();
                  appState.viewSplitScreen();
                }
              },
              m(
                "span",
                {
                  style: {
                    color: "white"
                  }
                },
                require("./svg/globe-placeholder")(svgW, svgH)
              ),
              t("Split Screen")
            )
          )

      // TODO add locations.
      // !rgPresent() ? '' : m('li', {
      //     class: routes[2] === orgid && routes[3] === 'locations'  ? 'active' : ''
      // }, m('a', {
      //     href: '/organizations/' + orgid + '/locations',
      //     config: m.route
      // }, require('./svg/directionsigns')(svgW, svgH), ' Locations'))
      //
    ]),
    m("ul.nav navbar-nav navbar-right", [
      !isAdmin()
        ? ""
        : m(
            "li",
            {
              class: view === "ORG" && subview === "ALL" ? "active" : ""
            },
            m(
              "a",
              {
                href: "#",
                onclick: function(ev) {
                  ev.preventDefault();
                  appState.viewOrganizations();
                }
              },
              orgPresent() ? t("Back to Organizations") : t("Organizations")
            )
          ),

      isAdmin() && !orgPresent()
        ? m(
            "li",
            {
              class: view === "USER" ? "active" : ""
            },
            m(
              "a",
              {
                href: "#",
                onclick: function(ev) {
                  ev.preventDefault();
                  appState.viewUsers();
                }
              },
              t("Users")
            )
          )
        : "",

      isAdmin() && !orgPresent()
        ? m(
            "li",
            {
              class: view === "DEVICE" ? "active" : ""
            },
            m(
              "a",
              {
                href: "#",
                onclick: function(ev) {
                  ev.preventDefault();
                  appState.viewDevices();
                }
              },
              t("Devices")
            )
          )
        : "",

      isAdmin() && !orgPresent()
        ? m(
            "li.dropdown.pointer",
            {
              class: this.adminToolsOpen ? "open" : "",
              onclick: () => this.adminToolsOpen = !this.adminToolsOpen,
              oncreate: node => this.adminDropDownConfigEl = node.dom
            },
            [
              m("a.dropdown-toggle", t("Messages"), m("span.caret")),
              m("ul.dropdown-menu", [
                isAdmin()
                  ? m(
                      "li",
                      {
                        class: state.view === "EVENTS" ? "active" : ""
                      },
                      m(
                        "a",
                        {
                          href: "#",
                          onclick: function(ev) {
                            ev.preventDefault();
                            appState.viewEvents();
                          }
                        },
                        t("Processed Messages")
                      )
                    )
                  : "",

                isAdmin()
                  ? m(
                      "li",
                      {
                        class: state.view === "RAWEVENTS" ? "active" : ""
                      },
                      m(
                        "a",
                        {
                          href: "#",
                          onclick: function(ev) {
                            ev.preventDefault();
                            appState.viewRawEvents();
                          }
                        },
                        t("Raw Messages")
                      )
                    )
                  : "",

                isAdmin()
                  ? m(
                      "li",
                      {
                        class: state.view === "EXCEPTIONS" ? "active" : ""
                      },
                      m(
                        "a",
                        {
                          href: "#",
                          onclick: function(ev) {
                            ev.preventDefault();
                            appState.viewExceptions();
                          }
                        },
                        t("Uncaught Exceptions")
                      )
                    )
                  : ""
              ])
            ]
          )
        : "",

      !orgPresent()
        ? ""
        : m(
            "li.dropdown.pointer",
            {
              class: vnode.state.manageOpen ? "open" : "",
              onclick: () => vnode.state.manageOpen = !vnode.state.manageOpen,
              oncreate: node => this.manageDropDownEl = node.dom
            },
            [
              m("a.dropdown-toggle", t("Manage"), m("span.caret")),
              m("ul.dropdown-menu", [
                !orgPresent()
                  ? ""
                  : m(
                      "li",
                      {
                        class: subview === "USERS" ? "active" : ""
                      },
                      m(
                        "a",
                        {
                          href: "#",
                          onclick: function(ev) {
                            ev.preventDefault();
                            appState.viewOrgUsers();
                          }
                        },
                        t("Users")
                      )
                    ),

                !orgPresent()
                  ? ""
                  : m(
                      "li",
                      {
                        class: subview === "FLEETS" ? "active" : ""
                      },
                      m(
                        "a",
                        {
                          href: "#",
                          onclick: function(ev) {
                            ev.preventDefault();
                            appState.viewOrgFleets();
                          }
                        },
                        t("Fleets")
                      )
                    ),

                !orgPresent()
                  ? ""
                  : m(
                      "li",
                      {
                        class: subview === "VEHICLES" ? "active" : ""
                      },
                      m(
                        "a",
                        {
                          href: "#",
                          onclick: function(ev) {
                            ev.preventDefault();
                            appState.viewOrgVehicles();
                          }
                        },
                        t("Vehicles")
                      )
                    )

                // !orgPresent() ? '' : m('li', {
                //     class: view === ''ALERTS'' ? 'active' : ''
                // }, m('a', {
                //     onclick: function () {
                //     appState.viewAlerts();
                // }
                // }, t('Alerts'))),
              ])
            ]
          ),

      !orgPresent()
        ? ""
        : m(
            "li",
            {
              class: view === "PROFILE" ? "active" : ""
            },
            m(
              "a",
              {
                href: "#",
                onclick: function(ev) {
                  ev.preventDefault();
                  appState.viewUserByID(state.user.username);
                }
              },
              t("Profile")
            )
          ),

      !orgPresent()
        ? ""
        : m(
            "li",
            {
              class: view === "HELP" ? "active" : ""
            },
            m(
              "a",
              {
                href: "#",
                onclick: function(ev) {
                  ev.preventDefault();
                  appState.viewHelp();
                }
              },
              t("Help")
            )
          ),

      m(
        "li",
        {
          class: view === "SESSION" ? "active" : ""
        },
        m(
          "a",
          {
            href: "#",
            onclick: function(ev) {
              ev.preventDefault();
              appState.viewLogin();
            }
          },
          t("☰") // Log Out
        )
      )
    ])
  ]);
};
