/* Copyright (c) 2016 Grant Miner */
"use strict";
const appState = require("../client/appState");

module.exports = function isUserMetric(value) {
  const state = appState.getState();
  return state.user && state.user.metric;
};
