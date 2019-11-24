/* Copyright (c) 2016 Grant Miner */
"use strict";
import { cloneDeep } from 'lodash';
import io from 'socket.io-client'
export { stopListening, startListening };

let socket;

function handleChange(store, msg) {
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

    const event = cloneDeep(store.getState().vehiclesByID[msg.new_val.vid]);

    if (event != null) {
      event.last = msg.new_val;

      // Refer to module.exports.getAllVehicleStatus in dao.js
      // 'event' is really the vehicle object with .last property containing the last status.
      // Ideally get rid of the .last and just make it the status itself.

      store.dispatch({
        type: "CHANGED_VEHICLE_HISTORY",
        event: event
      });
    }
  }
}

function stopListening() {
  socket.close();
}

function startListening(store) {
  socket = io();
  socket.on("connect", function() {
    console.log("Socket connected.");
    store.dispatch({
      type: "SOCKET_CONNECT"
    });
  });
  socket.on("disconnect", function(e) {
    console.error(e);
    store.dispatch({
      type: "SOCKET_DISCONNECT"
    });
  });
  socket.on("error", function(e) {
    console.error(e);
    store.dispatch({
      type: "SOCKET_DISCONNECT"
    });
  });
  socket.on("reconnect", function() {
    console.log("Socket reconnect.");
    store.dispatch({
      type: "SOCKET_CONNECT"
    });
  });

  // Not needed now as vehicles update their location.
  // socket.on("vehiclehistory", msg => {
  //   if (!store.getState().autoUpdate) {
  //     // Don't auto update map TODO improve this
  //     return;
  //   }
  //   handleChange(store, msg);
  // });

  const tables = ["users", "devices", "vehicles", "errors"];
  tables.forEach(function(table) {
    socket.on(table, ev => {
      // TODO uncomment for live updates
      // console.log(ev);
    });
  });

  socket.on("organizations", function(ev) {
    ev = JSON.parse(ev);

    if (ev.new_val == null) {
      store.dispatch({
        type: "DELETE_ORG",
        org: ev.old_val
      });
    } else {
      store.dispatch({
        type: "SAVE_ORG",
        org: ev.new_val
      });
    }
  });

  socket.on("users", function(ev) {
    ev = JSON.parse(ev);

    if (ev.new_val == null) {
      store.dispatch({
        type: "DELETE_USER",
        user: ev.old_val
      });
    } else {
      store.dispatch({
        type: "SAVE_USER",
        user: ev.new_val
      });
    }
  });

  socket.on("devices", function(ev) {
    ev = JSON.parse(ev);

    if (ev.new_val == null) {
      store.dispatch({
        type: "DELETE_DEVICE",
        device: ev.old_val
      });
    } else {
      store.dispatch({
        type: "SAVE_DEVICE",
        device: ev.new_val
      });
    }
  });

  socket.on("vehicles", function(ev) {
    ev = JSON.parse(ev);

    if (ev.new_val == null) {
      store.dispatch({
        type: "DELETE_VEHICLE",
        vehicle: ev.old_val
      });
    } else {
      store.dispatch({
        type: "SAVE_VEHICLE",
        vehicle: ev.new_val
      });
    }
  });

  socket.on("fleets", function(ev) {
    let state = store.getState();
    ev = JSON.parse(ev);

    if (ev.new_val == null) {
      if (ev.old_val.orgid === state.selectedOrg.id) {
        store.dispatch({
          type: "DELETE_FLEET",
          fleet: ev.old_val
        });
      }
    } else {
      if (ev.new_val.orgid === state.selectedOrg.id) {
        store.dispatch({
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

