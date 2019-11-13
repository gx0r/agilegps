"use strict";
const hasLang = require("./i18n").hasLang;

module.exports = {
  lang: "", // set below

  user: {},

  fleetsByID: {}, // only for the select org

  selectedAllFleets: false,
  selectedFleets: [],
  selectedVehicles: [],
  selectedVehicle: null,
  selectedVehicleHistory: [],
  selectedOrg: {},

  impliedSelectedVehicles: [],

  usersByID: {}, // username is the ID
  devicesByID: {},
  orgsByID: {},
  vehiclesByID: {},

  lastUpdated: new Date(),

  selectedItem: null,

  view: "SESSION",
  subview: "",
  viewID: "", // object ID to view, if any

  startDate: new Date(),
  endDate: new Date(),

  // events / errors / rawevents
  eventCount: 0,
  events: [],
  rawevents: [],
  exceptions: [],
  page: 1,
  pagesize: 300,
  search: "",

  // view state
  autoUpdate: true,
  realTimeUpdates: false, // is the socket.io connection is working
  showLatLong: false,
  verbose: false
};

if (navigator.languages) {
  for (let lang of navigator.languages) {
    if (hasLang(lang)) {
      this.lang = lang;
      break;
    }
  }
}
