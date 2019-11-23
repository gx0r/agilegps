/* Copyright (c) 2016 Grant Miner */
"use strict";
// import "setimmediate";
import "bootstrap/less/bootstrap.less";
// import "pikaday2/css/pikaday.css";
import "./style.css";
require("isomorphic-fetch");
// require('nprogress/nprogress.css');

import React from "react";
import ReactDOM from "react-dom";

window.Promise = require("bluebird");
window.Promise.config({
  cancellation: true, // animation relies on promise cancellation.
  longStackTraces: true,
  warnings: false
});

import appState, { store } from "./appState";

import Root from "./components/root2";
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { toast } from 'react-toastify';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-confirm-alert/src/react-confirm-alert.css';
import './css/toasts.css';

const rootComponent = (
  <IntlProvider locale="en-US">
    <Provider store={ store }>
      <Root />
      <ToastContainer
        autoClose={ 4000 }
        position={ toast.POSITION.BOTTOM_RIGHT }
      />
    </Provider>
  </IntlProvider>
);

ReactDOM.render(
  rootComponent,
  document.getElementById('root')
);

// require("./markers/OrgMarkers");
require("./appSocketState");

// if ('scrollRestoration' in history) {
// 	// Back off, browser, I got this...
// 	history.scrollRestoration = 'manual';
// }
