/* Copyright (c) 2016 Grant Miner */
"use strict";
/*
Draws the individual vehicle history markers and provides functions to animate them.
*/

const helpers = require("../../common/helpers");
const tomiles = require("../tomiles");
const Status = require("../../common/status");
const TheMap = require("../map");
const toGoogle = require("../togoogle");
const ClickListenerFactory = require("./clicklistenerfactory");
const appState = require("../appState.js");

const store = appState.getStore();

let i = 0;
let paused = false;
let playing = false;
let lines = [];
let markersById = {};

let playPromise,
  history,
  progressEl,
  speed = 0,
  _controller;

function create(item) {
  let position = toGoogle(item);
  if (!position) {
    console.warn("Invalid vehicle position " + JSON.stringify(item));
    return;
  }

  let icon = Status.getMarkerIconIndividualHistory(item);

  let marker = new google.maps.Marker({
    position: position,
    map: TheMap.getMap(),
    title: item.name
  });

  if (icon == null) {
    marker.setVisible(false); // hide moving markers
  } else {
    marker.setIcon(icon);
  }
  // markers.push(marker);
  markersById[item.id] = marker;

  google.maps.event.addListener(
    marker,
    "click",
    ClickListenerFactory.create(marker, item, position)
  );

  return marker;
}

module.exports.clickMarkerByID = function(id) {
  new google.maps.event.trigger(markersById[id], "click");
};

let lastState = require("../appDefaultState");

store.subscribe(function() {
  TheMap.getReady().then(function() {
    let state = store.getState();

    // let lastSelectedVehicle = lastState.selectedVehicle;
    // let lastStateVehicleStatusByID = lastState.vehicleStatusByID;
    // let vid = state.selectedVehicle ? state.selectedVehicle.id : '';
    //
    // if (lastSelectedVehicle === state.selectedVehicle &&
    //     lastStateVehicleStatusByID[vid] === state.vehicleStatusByID[vid]
    // ) {
    //     return;
    // }

    let lastSelectedVehicle = lastState.selectedVehicle || {};
    let lastSelectedVehicleHistory = lastState.selectedVehicleHistory;

    lastState = state;

    if (lastSelectedVehicle === state.selectedVehicle) {
      // if we're looking at the same vehicle, but not autoupdating the map, don't do anything
      if (!state.autoUpdate) {
        return;
      } else if (
        lastSelectedVehicleHistory === lastState.selectedVehicleHistory
      ) {
        return;
      }
    }

    if (
      lastSelectedVehicle !== state.selectedVehicle ||
      lastSelectedVehicleHistory !== state.selectedVehicleHistory
    ) {
      // need to clear old markers
      _.toArray(markersById).forEach(function(marker) {
        marker.setMap(null);
      });

      lines.forEach(function(line) {
        line.setMap(null);
      });

      lines = [];
      markersById = {};

      paused = false;
      playing = false;
    }

    if (state.selectedVehicle != null) {
      let vehicleHistory = state.selectedVehicleHistory;
      if (vehicleHistory && vehicleHistory.length) {
        history = helpers.addStartStop(
          // helpers.rollup(
          helpers.cleanData(
            // helpers.onlyVisibleHistory(
            _.cloneDeep(vehicleHistory)
          )
        );
        // history = history.filter(function (item) {
        // 	return Status.getStatus(item) === 'Sensor Motion';
        // })
        drawAll();
      } else {
        stop();
      }
    }
  });
});

function controller(ctrl) {
  if (ctrl != null) {
    _controller = ctrl;
  } else {
    return _controller;
  }
}
module.exports.controller = controller;

// set the progress element
function setProgressElement(el) {
  progressEl = el;
}
module.exports.setProgressElement = setProgressElement;

// function history (hist) {
//     history = helpers.addStartStop(helpers.rollup(helpers.cleanData(_.cloneDeep(hist))));
// };
// module.exports.history = history;

function animateFrame(i) {
  if (progressEl) {
    progressEl.value = i;
  }
  let next = toGoogle(history[i]);

  if (!next) {
    console.warn(
      "Vehicle animation frame " +
        i +
        ", invalid position " +
        JSON.stringify(next)
    );
    return;
  }

  let prev;
  let flightPlanCoordinates;
  if (i > 0) {
    prev = toGoogle(history[i - 1]);
    flightPlanCoordinates = [prev, next];
  }

  if (next) {
    TheMap.getMap().setCenter(next);
  } else {
    TheMap.getMap().setCenter(prev);
  }
  let speed = tomiles(history[i].s);
  let color = Status.getStatusColor(history[i]);

  create(history[i], controller());

  let lineSymbol = {
    path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW
  };

  if (
    flightPlanCoordinates &&
    flightPlanCoordinates.length == 2 &&
    flightPlanCoordinates[0] != null &&
    flightPlanCoordinates[1] != null
  ) {
    lines.push(
      new google.maps.Polyline({
        path: flightPlanCoordinates,
        // https://developers.google.com/maps/documentation/javascript/examples/overlay-symbol-arrow
        // icons: [{
        // 	icon: lineSymbol,
        // 	offset: '50%'
        // }],
        geodesic: true,
        strokeColor: color,
        strokeOpacity: 0.8,
        strokeWeight: 3,
        // position: loc,
        map: TheMap.getMap()
        // title: i + ''
      })
    );
  }
}
module.exports.animateFrame = animateFrame;

function stop() {
  // if (playPromise) {
  //     try {
  // 	    playPromise.cancel();
  //     } catch (e) {
  //         console.error(e);
  //     }
  // }

  _.toArray(markersById).forEach(function(marker) {
    marker.setMap(null);
  });
  lines.forEach(function(line) {
    line.setMap(null);
  });

  if (progressEl) {
    progressEl.value = 0;

    if (history && history.length) {
      progressEl.max = history.length - 1;
    }
  }

  i = 0;
  playPromise = Promise.resolve(true);
  paused = false;
  playing = false;
}
module.exports.stop = stop;

function play() {
  if (playing === false) {
    stop();
  }
  paused = false;
  playing = true;
  nextAnimation();
}
module.exports.play = play;

function pause() {
  paused = true;
}
module.exports.pause = pause;

function isPausable() {
  return playing && !paused;
}
module.exports.isPausable = isPausable;

function isPlayable() {
  return !playing || paused;
}
module.exports.isPlayable = isPlayable;

function isStoppable() {
  return playing || paused;
}
module.exports.isStoppable = isStoppable;

function drawAll() {
  stop();
  let x = 0;
  for (; x < history.length; x++) {
    animateFrame(x);
  }
  fitBounds();
}
module.exports.drawAll = drawAll;

function nextAnimation() {
  if (speed === 0) {
    return drawAll();
  } else {
    playPromise = playPromise.then(function() {
      if (i < history.length) {
        return Promise.delay(speed).then(function() {
          if (!paused && playing) {
            animateFrame(i);
            if (i === history.length - 1) {
              playing = false;
              paused = false;
            } else {
              i += 1;
              nextAnimation();
            }
          }
        });
      }
    });
  }
}

module.exports.nextAnimation = nextAnimation;

function setSpeed(value) {
  speed = parseInt(value, 10);
}
module.exports.setSpeed = setSpeed;

function fitBounds() {
  let latlngbounds = new google.maps.LatLngBounds();

  history.forEach(function(item) {
    let segment = toGoogle(item);
    if (segment) {
      latlngbounds.extend(segment);
    }
  });
  TheMap.getMap().fitBounds(latlngbounds);
}
module.exports.fitBounds = fitBounds;
