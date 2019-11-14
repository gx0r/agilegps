/* Copyright (c) 2016 Grant Miner */
"use strict";
/**
Uses Redux ( https://github.com/reactjs/redux ) to handle and keep all application state in one place.
*/
const _ = require("lodash");
const io = require("socket.io-client");
const Cookies = require("cookies-js");
const appState = require("./appState");

/*
Socket.io
*/
let lastJwt;
let socket;
function handleChange(msg) {
  msg = JSON.parse(msg);

  if (msg.new_val) {
    // console.log(msg.new_val);

    /* new_val is like
        a: 147
        bp: 1
        cmd: "FRI"
        d: "2016-02-29T04:02:28.000Z"
        g: 11
        h: "FAKE:00:00"
        id: "20160228220228|1|0015"
        ig: true
        la: 18.08073
        lo: 61.51553
        m: 0
        mo: true
        p: "14055"
        rid: "1"
        rty: "0"
        s: 69
        v: "14055"
        vid: "agen1"
        */
    const state = appState.getState();

    const event = _.cloneDeep(state.vehiclesByID[msg.new_val.vid]);

    if (event != null) {
      event.last = msg.new_val;

      // Refer to module.exports.getAllVehicleStatus in dao.js
      // 'event' is really the vehicle object with .last property containing the last status.
      // Ideally get rid of the .last and just make it the status itself.

      appState.getStore().dispatch({
        type: "CHANGED_VEHICLE_HISTORY",
        event: event
      });
    }
  }
}

appState.getStore().subscribe(function() {
  const state = appState.getState();
  const jwt = Cookies.get("jwt");

  if (lastJwt !== jwt) {
    lastJwt = jwt;
    if (socket) {
      console.log("Disconnecting socket.");
      socket.disconnect();
    }

    if (!state.user.username) {
      return;
    }

    socket = io();
    socket.on("connect", function() {
      console.log("Socket connected.");
      appState.getStore().dispatch({
        type: "SOCKET_CONNECT"
      });
    });
    socket.on("disconnect", function(e) {
      console.error(e);
      appState.getStore().dispatch({
        type: "SOCKET_DISCONNECT"
      });
    });
    socket.on("error", function(e) {
      console.error(e);
      appState.getStore().dispatch({
        type: "SOCKET_DISCONNECT"
      });
    });
    socket.on("reconnect", function() {
      console.log("Socket reconnect.");
      appState.getStore().dispatch({
        type: "SOCKET_CONNECT"
      });
    });

    socket.on("vehiclehistory", msg => {
      // const state = appState.getState();
      // if (!state.autoUpdate) {
      //   // Don't auto update map TODO improve this
      //   return;
      // }
      handleChange(msg);
    });
    let tables = ["users", "devices", "vehicles", "errors"];
    tables.forEach(function(table) {
      socket.on(table, function(ev) {
        // TODO live updates
        console.log(ev);
      });
    });

    socket.on("organizations", function(ev) {
      ev = JSON.parse(ev);

      if (ev.new_val == null) {
        appState.getStore().dispatch({
          type: "DELETE_ORG",
          org: ev.old_val
        });
      } else {
        appState.getStore().dispatch({
          type: "SAVE_ORG",
          org: ev.new_val
        });
      }
    });

    socket.on("users", function(ev) {
      ev = JSON.parse(ev);

      if (ev.new_val == null) {
        appState.getStore().dispatch({
          type: "DELETE_USER",
          user: ev.old_val
        });
      } else {
        appState.getStore().dispatch({
          type: "SAVE_USER",
          user: ev.new_val
        });
      }
    });

    socket.on("devices", function(ev) {
      ev = JSON.parse(ev);

      if (ev.new_val == null) {
        appState.getStore().dispatch({
          type: "DELETE_DEVICE",
          device: ev.old_val
        });
      } else {
        appState.getStore().dispatch({
          type: "SAVE_DEVICE",
          device: ev.new_val
        });
      }
    });

    socket.on("vehicles", function(ev) {
      ev = JSON.parse(ev);

      if (ev.new_val == null) {
        appState.getStore().dispatch({
          type: "DELETE_VEHICLE",
          vehicle: ev.old_val
        });
      } else {
        appState.getStore().dispatch({
          type: "SAVE_VEHICLE",
          vehicle: ev.new_val
        });
      }
    });

    socket.on("fleets", function(ev) {
      let state = appState.getStore().getState();
      ev = JSON.parse(ev);

      if (ev.new_val == null) {
        if (ev.old_val.orgid === state.selectedOrg.id) {
          appState.getStore().dispatch({
            type: "DELETE_FLEET",
            fleet: ev.old_val
          });
        }
      } else {
        if (ev.new_val.orgid === state.selectedOrg.id) {
          appState.getStore().dispatch({
            type: "SAVE_FLEET",
            fleet: ev.new_val
          });
        }
      }
    });

    socket.on("errors", function(ev) {
      ev = JSON.parse(ev);

      if (ev.old_val == null) {
        // window.alert(JSON.stringify(ev.new_val));
        console.error(JSON.stringify(ev.new_val));
      }
    });
  }
});
