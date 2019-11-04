/* Copyright (c) 2016 Grant Miner */
"use strict";
const m = require("mithril");
const navbar = require("./navbar");
const TheMap = require("./map");
const session = require("./session");
const organizations = require("./organizations");
const organization = require("./organization");
const neworganization = require("./organization-new");
const users = require("./users");
const user = require("./user");
const newuser = require("./user-new");
const vehicles = require("./vehicles");
const vehicle = require("./vehicle");
const newvehicle = require("./vehicle-new");
const devices = require("./devices");
const newdevice = require("./device-new");
const events = require("./events");
const reports = require("./reports/reports");
const alerts = require("./alerts");
const locations = require("./locations");
const fleets = require("./fleets");
const help = require("./help");
const sidebar = require("./sidebar");
const appState = require("./appState");

const USER = "USER";
const USERS = "USERS";
const ORG = "ORG";
const ORGS = "ORGS";
const DEVICE = "DEVICE";
const DEVICES = "DEVICES";
const FLEET = "FLEET";
const FLEETS = "FLEETS";
const VEHICLE = "VEHICLE";
const VEHICLES = "VEHICLES";

const NEW = "NEW";
const EDIT = "EDIT";
const ALL = "ALL";

const SPLIT = "SPLIT";
const MAP = "MAP";
const REPORT = "REPORT";

const EVENTS = "EVENTS";
const RAWEVENTS = "RAWEVENTS";
const EXCEPTIONS = "EXCEPTIONS";

const HELP = "HELP";
const SESSION = "SESSION";

module.exports.getMapElement = function() {
  return mapElement;
};

let mapElement = null;

module.exports.controller = function(args, extras) {
  const ctrl = this;

  ctrl.mapVisible = function(visible, tall) {
    TheMap.setVisible(visible, tall);
  };

  ctrl.mapInitialized = false;

  this.mapElement = function(el, isInitialized) {
    if (!isInitialized) {
      ctrl.mapInitialized = true;
      TheMap.mount(el);
      mapElement = el;
    }
  };
};

module.exports.view = function(ctrl, args, extras) {
  const state = appState.getState();
  const view = state.view;
  const subview = state.subview;

  if (view === HELP) {
    ctrl.mapVisible(false);
    ctrl.reportComponent = null;
    ctrl.sidebarComponent = null;
    ctrl.mainComponent = help;
  } else if (view === SESSION) {
    ctrl.mapVisible(false);
    ctrl.reportComponent = null;
    ctrl.sidebarComponent = null;
    ctrl.mainComponent = session;
  } else if (subview === ORG) {
    if (view === USER) {
      ctrl.mapVisible(false);
      ctrl.reportComponent = null;
      ctrl.sidebarComponent = null;
      ctrl.mainComponent = users;
    } else if (view === FLEET) {
      ctrl.mapVisible(false);
      ctrl.reportComponent = null;
      ctrl.sidebarComponent = null;
      ctrl.mainComponent = fleets;
    } else if (view === VEHICLE) {
      ctrl.mapVisible(false);
      ctrl.reportComponent = null;
      ctrl.sidebarComponent = null;
      ctrl.mainComponent = vehicles;
    }
  } else if (view === EVENTS || view === RAWEVENTS || view === EXCEPTIONS) {
    ctrl.mapVisible(false);
    ctrl.reportComponent = null;
    ctrl.sidebarComponent = null;
    ctrl.mainComponent = m.component(events);
  } else if (subview === ALL) {
    if (view === ORG) {
      ctrl.mapVisible(false);
      ctrl.reportComponent = null;
      ctrl.sidebarComponent = null;
      ctrl.mainComponent = organizations;
    }

    if (view === USER) {
      ctrl.mapVisible(false);
      ctrl.reportComponent = null;
      ctrl.sidebarComponent = null;
      ctrl.mainComponent = users;
    }

    if (view === DEVICE) {
      ctrl.mapVisible(false);
      ctrl.reportComponent = null;
      ctrl.sidebarComponent = null;
      ctrl.mainComponent = devices;
    }
  } else if (view === ORG) {
    ctrl.mapVisible(true, false);

    if (subview === REPORT) {
      ctrl.reportComponent = reports;
      ctrl.mapVisible(false);
    } else {
      if (state.selectedVehicle) {
        ctrl.reportComponent = vehicle;
      } else {
        ctrl.reportComponent = organization;
      }
    }

    if (subview === MAP) {
      ctrl.mapVisible(true, true);
    }

    if (subview === SPLIT) {
      ctrl.mapVisible(true, false);
    }
    ctrl.sidebarComponent = sidebar;
    ctrl.mainComponent = null;

    if (subview === EDIT) {
      ctrl.mapVisible(false);
      ctrl.reportComponent = null;
      ctrl.sidebarComponent = null;
      ctrl.mainComponent = neworganization;
    }

    if (subview === NEW) {
      ctrl.mapVisible(false);
      ctrl.reportComponent = null;
      ctrl.sidebarComponent = null;
      ctrl.mainComponent = neworganization;
    }
  } else if (view === DEVICE) {
    ctrl.mapVisible(false);

    ctrl.reportComponent = null;
    ctrl.sidebarComponent = null;
    ctrl.mainComponent = newdevice;
  } else if (view === USER) {
    ctrl.mapVisible(false);

    ctrl.reportComponent = null;
    ctrl.sidebarComponent = null;
    ctrl.mainComponent = newuser;
  } else if (view === VEHICLE) {
    ctrl.mapVisible(false);

    ctrl.reportComponent = null;
    ctrl.sidebarComponent = null;
    ctrl.mainComponent = newvehicle;
  } else {
    ctrl.mapVisible(false);
    ctrl.mainComponent = session;
  }

  return m("div", [
    m("nav.navbar navbar-static-top navbar-inverse", [m.component(navbar)]),
    m(
      "div.container-fluid",
      m(".row", [
        m("div#sidebar.col-sm-2", [ctrl.sidebarComponent]),
        m(".col-sm-10", [
          ctrl.mapInitialized
            ? {
                subtree: "retain"
              }
            : m(".map shadow", {
                style: {
                  // visibility: 'hidden'
                },
                config: ctrl.mapElement
              }),
          // report
          ctrl.reportComponent
        ])
      ])
    ),
    m(".container-fluid", [m(".row", [ctrl.mainComponent])])
  ]);
};
