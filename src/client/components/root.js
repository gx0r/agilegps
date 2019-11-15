// /* Copyright (c) 2016 Grant Miner */
"use strict";
// const m = require("mithril");
// const navbar = require("./navbar");
// const TheMap = require("./map");
// const session = require("./session");
// const organizations = require("./organizations");
// const organization = require("./organization");
// const neworganization = require("./organization-new");
// const users = require("./users");
// const user = require("./user");
// const newuser = require("./user-new");
// const vehicles = require("./vehicles");
// const vehicle = require("./vehicle");
// const newvehicle = require("./vehicle-new");
// const devices = require("./devices");
// const newdevice = require("./device-new");
// const events = require("./events");
// const reports = require("./reports/reports");
// const alerts = require("./alerts");
// const locations = require("./locations");
// const fleets = require("./fleets");
// const help = require("./help");
// const sidebar = require("./sidebar");
// const appState = require("./appState");

// const USER = "USER";
// const USERS = "USERS";
// const ORG = "ORG";
// const ORGS = "ORGS";
// const DEVICE = "DEVICE";
// const DEVICES = "DEVICES";
// const FLEET = "FLEET";
// const FLEETS = "FLEETS";
// const VEHICLE = "VEHICLE";
// const VEHICLES = "VEHICLES";

// const NEW = "NEW";
// const EDIT = "EDIT";
// const ALL = "ALL";

// const SPLIT = "SPLIT";
// const MAP = "MAP";
// const REPORT = "REPORT";

// const EVENTS = "EVENTS";
// const RAWEVENTS = "RAWEVENTS";
// const EXCEPTIONS = "EXCEPTIONS";

// const HELP = "HELP";
// const SESSION = "SESSION";

// let mapElement = null;

// export function getMapElement() {
//   return mapElement;
// };

// export function oninit(vnode) {
//   this.mapVisible = function(visible, tall) {
//     TheMap.setVisible(visible, tall);
//   };

//   this.mapInitialized = false;

//   this.setMapElement = function(el) {
//     if (!this.isInitialized) {
//       this.mapInitialized = true;
//       TheMap.mount(el);
//       mapElement = el;
//     }
//   };
// };

// export function view(vnode) {
//   const state = appState.getState();
//   const view = state.view;
//   const subview = state.subview;

//   if (view === HELP) {
//     this.mapVisible(false);
//     this.reportComponent = null;
//     this.sidebarComponent = null;
//     this.mainComponent = m(help);
//   } else if (view === SESSION) {
//     this.mapVisible(false);
//     this.reportComponent = null;
//     this.sidebarComponent = null;
//     this.mainComponent = m(session);
//   } else if (subview === ORG) {
//     if (view === USER) {
//       this.mapVisible(false);
//       this.reportComponent = null;
//       this.sidebarComponent = null;
//       this.mainComponent = m(users);
//     } else if (view === FLEET) {
//       this.mapVisible(false);
//       this.reportComponent = null;
//       this.sidebarComponent = null;
//       this.mainComponent = m(fleets);
//     } else if (view === VEHICLE) {
//       this.mapVisible(false);
//       this.reportComponent = null;
//       this.sidebarComponent = null;
//       this.mainComponent = m(vehicles);
//     }
//   } else if (view === EVENTS || view === RAWEVENTS || view === EXCEPTIONS) {
//     this.mapVisible(false);
//     this.reportComponent = null;
//     this.sidebarComponent = null;
//     this.mainComponent = m(events);
//   } else if (subview === ALL) {
//     if (view === ORG) {
//       this.mapVisible(false);
//       this.reportComponent = null;
//       this.sidebarComponent = null;
//       this.mainComponent = m(organizations);
//     }

//     if (view === USER) {
//       this.mapVisible(false);
//       this.reportComponent = null;
//       this.sidebarComponent = null;
//       this.mainComponent = m(users);
//     }

//     if (view === DEVICE) {
//       this.mapVisible(false);
//       this.reportComponent = null;
//       this.sidebarComponent = null;
//       this.mainComponent = m(devices);
//     }
//   } else if (view === ORG) {
//     this.mapVisible(true, false);

//     if (subview === REPORT) {
//       this.reportComponent = m(reports);
//       this.mapVisible(false);
//     } else {
//       if (state.selectedVehicle) {
//         this.reportComponent = m(vehicle);
//       } else {
//         this.reportComponent = m(organization);
//       }
//     }

//     if (subview === MAP) {
//       this.mapVisible(true, true);
//     }

//     if (subview === SPLIT) {
//       this.mapVisible(true, false);
//     }
//     this.sidebarComponent = m(sidebar);
//     this.mainComponent = null;

//     if (subview === EDIT) {
//       this.mapVisible(false);
//       this.reportComponent = null;
//       this.sidebarComponent = null;
//       this.mainComponent = m(neworganization);
//     }

//     if (subview === NEW) {
//       this.mapVisible(false);
//       this.reportComponent = null;
//       this.sidebarComponent = null;
//       this.mainComponent = m(neworganization);
//     }
//   } else if (view === DEVICE) {
//     this.mapVisible(false);

//     this.reportComponent = null;
//     this.sidebarComponent = null;
//     this.mainComponent = m(newdevice);
//   } else if (view === USER) {
//     this.mapVisible(false);

//     this.reportComponent = null;
//     this.sidebarComponent = null;
//     this.mainComponent = m(newuser);
//   } else if (view === VEHICLE) {
//     this.mapVisible(false);

//     this.reportComponent = null;
//     this.sidebarComponent = null;
//     this.mainComponent = m(newvehicle);
//   } else {
//     this.mapVisible(false);
//     this.mainComponent = m(session);
//   }

//   return m("div", [
//     m("nav.navbar navbar-static-top navbar-inverse", [m(navbar)]),
//     m(
//       "div.container-fluid",
//       m(".row", [
//         m("div#sidebar.col-sm-2", [this.sidebarComponent]),
//         m(".col-sm-10", [
//           // this.mapInitialized
//           //   ? {
//           //       subtree: "retain"
//           //     }
//           //   : 
//             m(".map shadow", {
//               style: {
//                 // visibility: 'hidden'
//               },
//               oncreate: vnode => {
//                 if (this.mapInitialized) {
//                   return;
//                 }
//                 this.setMapElement(vnode.dom);
//               },
//               onbeforeupdate: () => {
//                 if (this.mapInitialized) {
//                   return false;
//                 }
//               },
//             }),
//           // report
//           this.reportComponent
//         ])
//       ])
//     ),
//     m(".container-fluid", [m(".row", [this.mainComponent])])
//   ]);
// };


import React from 'react';
import ReactDOM from 'react-dom';

import Navbar from './navbar';
import Map from './map';
import Sidebar from './sidebar';

export class Root extends React.Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
  }

  componentDidMount() {
    // m.render(m(navbar), this.myRef.current);
  }

  render() {
    return (
      <div>
        <Navbar />
        <div className="container-fluid">
          <div className="row">
            <div className="sidebar col-sm-2">
              <Sidebar />
            </div>
            <div className="col-sm-10">
              <Map />
            </div>            
          </div>
        </div>
        <div className="container-fluid">
          <div className="row">
            {/* <MainComponent /> */}
          </div>
        </div>
      </div>
      // return m("div", [
        //     m("nav.navbar navbar-static-top navbar-inverse", [m(navbar)]),
        //     m(
        //       "div.container-fluid",
        //       m(".row", [
        //         m("div#sidebar.col-sm-2", [this.sidebarComponent]),
        //         m(".col-sm-10", [
        //           // this.mapInitialized
        //           //   ? {
        //           //       subtree: "retain"
        //           //     }
        //           //   : 
        //             m(".map shadow", {
        //               style: {
        //                 // visibility: 'hidden'
        //               },
        //               oncreate: vnode => {
        //                 if (this.mapInitialized) {
        //                   return;
        //                 }
        //                 this.setMapElement(vnode.dom);
        //               },
        //               onbeforeupdate: () => {
        //                 if (this.mapInitialized) {
        //                   return false;
        //                 }
        //               },
        //             }),
        //           // report
        //           this.reportComponent
        //         ])
        //       ])
        //     ),
        //     m(".container-fluid", [m(".row", [this.mainComponent])])
        //   ]);
    );
  }
}
