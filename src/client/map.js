/* Copyright (c) 2016 Grant Miner */
"use strict";
const raf = require("raf");
const Velocity = require("velocity-animate");
const markersByVehicle = Object.create(null);

let mapLoaded = false;
let visible = false;

let map;
let mapElement;
let queued;

let readyResolver;
let ready = new Promise(function(resolver, rejecter) {
  readyResolver = resolver;
});

module.exports.mount = function(el) {
  // el.style.height = "400px";
  // map = new google.maps.Map(el, {
  //   zoom: 4,
  //   center: { lat: 50, lng: -98.35 },
  //   rotateControl: true
  // });

  // Default map type.
  // map.setMapTypeId(google.maps.MapTypeId.HYBRID);
  // map.setMapTypeId(google.maps.MapTypeId.TERRAIN);

  mapElement = el.firstChild;

  if (queued) {
    setVisible(queued[0], queued[1]).then(function() {
      readyResolver(mapElement);
    });
  }
};

module.exports.setMap = function(map) {
  this.map = map;
}

module.exports.getMap = function() {
  return map;
};

module.exports.getReady = function() {
  return ready;
};

function setVisible(bool, tall) {
  // visible = bool;

  // if (!mapElement) {
  //   queued = [bool, tall];
  //   return;
  // }

  // mapElement.style.visibility = bool ? "" : "hidden";

  // let height;

  // if (tall) {
  //   height = window.innerHeight - 300;
  //   if (height < 200) height = 200;
  // } else {
  //   height = 400;
  // }
  // height = height + "px";

  // mapElement.style.height = bool ? height : "0";

  // // Force a repaint
  // mapElement.style.display = "none";
  // mapElement.offsetHeight; // no need to store this anywhere, the reference is enough
  // mapElement.style.display = "";

  // // Trigger resize
  // google.maps.event.trigger(map, "resize");

  // // Wait until requestAnimationFrame to allow map to draw
  // ready = new Promise(function(resolver, rejecter) {
  //   raf(function tick() {
  //     resolver();
  //   });
  // });
  // return ready;
  ready = Promise.resolve();
  return ready;
}
module.exports.setVisible = setVisible;
