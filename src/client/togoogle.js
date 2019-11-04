/* Copyright (c) 2016 Grant Miner */
"use strict";
function toGoogle(history) {
  if (history && history.la && history.lo) {
    return new google.maps.LatLng(history.la, history.lo);
  }
}
module.exports = toGoogle;
