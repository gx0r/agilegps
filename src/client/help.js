/* Copyright (c) 2016 Grant Miner */
"use strict";
const m = require("mithril");

module.exports.view = function() {
  return m("div", [
    m(".col-sm-2"),
    m(
      "div.business-table.col-sm-8",
      m("h4", "Why don't I see fuel level for my vehicle?"),
      m(
        "div",
        "It depends on the vehicle. Not all vehicles report their fuel level."
      ),
      m("h4", "What does the battery level indicate?"),
      m("div", "The battery power of the GPS tracking device."),
      m("h4", "What does the mileage column for ignition events indicate?"),
      m(
        "div",
        'The duration, in the format of HH:MM:SS, is time spent with the ignition in the prior state. For example, if the status is "ign off", this means the ignition was turned off. The duration then shows how long the ignition ran (prior to being turned off). ' +
          'If the status is "Ign on," the time duration indicates how long the ignition was off.'
      ),
      // m('h4', 'What does possibly towing mean?'),
      // m('div', 'This means the vehicle tracking device thinks towing (vehicle tracking device is moving and the ignition is off) might be occuring.'),
      m("h4", 'What does "verbose" show?'),
      m(
        "div",
        "This shows the odometer and engine hours columns, as well as displaying more detailed informational messages from the trackers."
      ),
      m("h4", "What is a harsh status?"),
      m(
        "div",
        "The tracking device detected what it was programmed to be harsh acceleration, braking, or turning."
      ),
      // m('h4', 'What does ignition uncertain mean?'),
      // m('div', 'The vehicle tracking device does not have a confident read on the ignition. Check the wiring.'),
      m("h4", "What is advanced mode?"),
      m(
        "div",
        "This is toggled on a user's profile, and enables extra options in the vehicle history view."
      ),
      m("h4", "In advanced mode, what does calculate distances between mean?"),
      m(
        "div",
        "The mileage column shows mileage changed between events, then a vertical bar, then the trip mileage. E.g., 6|18 means the vehicle moved 6 miles and the trip mileage is at 18. The trips are normally calculated as distance between starts and stops, but you can have it calculated between ignition on and off instead."
      )
      // m('h4', 'In advanced mode, what does rollup stationary events do?'),
      // m('div', 'Idling and parked events are normally combined into a single row, with the mileage column showing the HH:MM:SS of time spent idling or parked.')
    )
  ]);
};
