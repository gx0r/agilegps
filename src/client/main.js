/* Copyright (c) 2016 Grant Miner */
"use strict";
import React from "react";
import ReactDOM from "react-dom";

// window.Promise = require("bluebird");
// window.Promise.config({
//   cancellation: true, // animation relies on promise cancellation.
//   longStackTraces: true,
//   warnings: false
// });

import { store } from "./appState";

import Root from "./components/root";
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';

import 'nprogress/nprogress.css';
import "bootstrap/less/bootstrap.less";
import "./css/style.css";
import 'react-toastify/dist/ReactToastify.css';
import 'react-confirm-alert/src/react-confirm-alert.css';
import './css/toasts.css';
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';

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
      return (
        <div style={{ margin: '2em' }}>
          <div>
            <a href="/">
              <img src="/images/logosmall.png" />
            </a>
          </div>
          <div>
            <h4>TODO, handle the following condition:</h4>
            <pre>
              { this.state.error + "" }
              { this.state.error.stack }
            </pre>
          </div>
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

// if ('scrollRestoration' in history) {
// 	// Back off, browser, I got this...
// 	history.scrollRestoration = 'manual';
// }
