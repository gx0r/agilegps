/* Copyright (c) 2016 Grant Miner */
"use strict";
require("es6-object-assign").polyfill();
require("setimmediate");
require("bootstrap/less/bootstrap.less");
require("pikaday2/css/pikaday.css");
require("./style.css");
require("isomorphic-fetch");
const React = require("react");
const ReactDOM = require("react-dom");

// require('nprogress/nprogress.css');

window.Promise = require("bluebird");
window.Promise.config({
  cancellation: true, // animation relies on promise cancellation.
  longStackTraces: true,
  warnings: false
});

const m = require("mithril");

const appState = require("./appState");


import { Root } from "./components/root";
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';

const rootComponent = (
  <IntlProvider locale="en-US">
    <Provider store={ appState.getStore() }>
      <Root />
    </Provider>
  </IntlProvider>
);

let RENDER_WITH_REACT;
RENDER_WITH_REACT = true;

if (RENDER_WITH_REACT) {
  ReactDOM.render(
    rootComponent,
    document.getElementById('root')
  );
} else {
  m.mount(document.getElementById("root"), require("./root"));
}


require("./markers/OrgMarkers");
require("./appSocketState");

// if ('scrollRestoration' in history) {
// 	// Back off, browser, I got this...
// 	// history.scrollRestoration = 'manual';
// }
