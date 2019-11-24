/* Copyright (c) 2016 Grant Miner */
"use strict";
import io from 'socket.io-client'
export { stopListening, startListening };

let socket;

function stopListening() {
  socket.close();
}

function startListening(dispatch) {
  if (socket) {
    socket.close();
  }

  socket = io();
  socket.on("connect", function() {
    console.log("Socket connected.");
    dispatch({
      type: "SOCKET_CONNECT"
    });
  });
  socket.on("disconnect", function(e) {
    console.warn(e);
    dispatch({
      type: "SOCKET_DISCONNECT"
    });
  });
  socket.on("error", function(e) {
    console.warn(e);
    dispatch({
      type: "SOCKET_DISCONNECT"
    });
  });
  socket.on("reconnect", function() {
    console.warn("Socket reconnect.");
    dispatch({
      type: "SOCKET_CONNECT"
    });
  });

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
      dispatch({
        type: "DELETE_ORG",
        org: ev.old_val
      });
    } else {
      dispatch({
        type: "SAVE_ORG",
        org: ev.new_val
      });
    }
  });

  socket.on("users", function(ev) {
    ev = JSON.parse(ev);

    if (ev.new_val == null) {
      dispatch({
        type: "DELETE_USER",
        user: ev.old_val
      });
    } else {
      dispatch({
        type: "SAVE_USER",
        user: ev.new_val
      });
    }
  });

  socket.on("devices", function(ev) {
    ev = JSON.parse(ev);

    if (ev.new_val == null) {
      dispatch({
        type: "DELETE_DEVICE",
        device: ev.old_val
      });
    } else {
      dispatch({
        type: "SAVE_DEVICE",
        device: ev.new_val
      });
    }
  });

  socket.on("vehicles", function(ev) {
    ev = JSON.parse(ev);

    if (ev.new_val == null) {
      dispatch({
        type: "DELETE_VEHICLE",
        vehicle: ev.old_val
      });
    } else {
      dispatch({
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
        dispatch({
          type: "DELETE_FLEET",
          fleet: ev.old_val
        });
      }
    } else {
      if (ev.new_val.orgid === state.selectedOrg.id) {
        dispatch({
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

