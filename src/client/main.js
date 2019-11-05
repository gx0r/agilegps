/* Copyright (c) 2016 Grant Miner */
"use strict";
require("es6-object-assign").polyfill();
require("setimmediate");
require("bootstrap/less/bootstrap.less");
require("pikaday2/css/pikaday.css");
require("./style.css");
require("isomorphic-fetch");

// require('nprogress/nprogress.css');

window.Promise = require("bluebird");
window.Promise.config({
  cancellation: true, // animation relies on promise cancellation.
  longStackTraces: true,
  warnings: false
});

const m = require("mithril");

const appState = require("./appState");

m.mount(document.getElementById("root"), require("./session"));

require("./markers/OrgMarkers");
require("./appSocketState");

// if ('scrollRestoration' in history) {
// 	// Back off, browser, I got this...
// 	// history.scrollRestoration = 'manual';
// }
