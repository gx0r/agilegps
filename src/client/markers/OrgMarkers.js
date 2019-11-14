/* Copyright (c) 2016 Grant Miner */
"use strict";
const _ = require("lodash");
const TheMap = require("../map");
const toGoogle = require("../togoogle");
const MarkerWithLabel = require("./markerWithLabel");
const Status = require("../../common/status");
const ClickListenerFactory = require("./clicklistenerfactory");
const appState = require("../appState.js");

const store = appState.getStore();

function create(item) {
  const map = TheMap.getMap();
  let position;
  if (item.last) {
    position = toGoogle(item.last);
  } else {
    position = toGoogle(item);
  }

  if (!position) {
    console.warn("Org marker, invalid position " + JSON.stringify(item));
    return;
  }

  const marker = new MarkerWithLabel({
    position: position,
    map: map,
    title: item.name,
    labelContent: item.name,
    labelAnchor: new google.maps.Point(0, 0),
    labelClass: "maplabel", // the CSS class for the label
    labelInBackground: false
  });

  marker.setIcon(Status.getMarkerIconFleetView(item.last));
  google.maps.event.addListener(
    marker,
    "click",
    ClickListenerFactory.create(marker, item, position)
  );

  return marker;
}

// const lastSelectedFleets = null;
let markersByVehicleID = {};

module.exports.clickMarkerByVehicleID = function(id) {
  const marker = markersByVehicleID[id];

  if (marker) {
    new google.maps.event.trigger(marker, "click");
    TheMap.getMap().panTo(marker.position);
  }
};

let lastState = require("../appDefaultState");

store.subscribe(() => {
  TheMap.getReady().then(() => {
    const state = store.getState();

    const lastImpliedSelectedVehicles = lastState.impliedSelectedVehicles;
    const lastStateVehicleStatusByID = lastState.vehiclesByID;

    if (
      lastImpliedSelectedVehicles !== state.impliedSelectedVehicles ||
      lastStateVehicleStatusByID !== state.vehiclesByID
    ) {
      if (
        !state.autoUpdate &&
        lastImpliedSelectedVehicles === state.impliedSelectedVehicles
      ) {
        // if we're looking at the same vehicles, but not autoupdating the map, don't do anything
        return;
      }

      // need to clear old markers
      _.toArray(markersByVehicleID).forEach(function(marker) {
        marker.setMap(null);
      });
      markersByVehicleID = {};
    }

    lastState = state;

    // if (state.vehiclesByID === lastStateVehicleStatusByID) {
    //     // vehicle status are the same, don't need to
    //     return;
    // }

    if (state.selectedFleetsAll || state.selectedFleets.length > 0) {
      // lastSelectedFleets = _.cloneDeep(state.selectedFleets);

      const bounds = new google.maps.LatLngBounds();
      const vehicles = state.impliedSelectedVehicles;

      state.impliedSelectedVehicles.forEach(function(vehicle) {
        if (state.vehiclesByID[vehicle.id]) {
          const marker = create(state.vehiclesByID[vehicle.id], false);
          if (marker) {
            bounds.extend(marker.position);
            if (markersByVehicleID[vehicle.id]) {
              markersByVehicleID[vehicle.id].setMap(null); // TODO why necessary
            }
            markersByVehicleID[vehicle.id] = marker;
          }
        }
      });

      Promise.delay(0).then(function() {
        TheMap.getMap().fitBounds(bounds);
      });
    }
  });
});
