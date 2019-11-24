/* Copyright (c) 2016 Grant Miner */
"use strict";
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

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error: error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    // logErrorToMyService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div>
          <h3>Something went wrong.</h3>
          <pre>
            { this.state.error + "" }
            { this.state.error.stack }
          </pre>
        </div>
      )
    }

    return this.props.children; 
  }
}

const rootComponent = (
  <ErrorBoundary>
    <IntlProvider locale="en-US">
      <Provider store={ store }>
        <Root />
        <ToastContainer
          autoClose={ 4000 }
          position={ toast.POSITION.BOTTOM_RIGHT }
        />
      </Provider>
    </IntlProvider>
  </ErrorBoundary>
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
