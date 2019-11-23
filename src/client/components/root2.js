// /* Copyright (c) 2016 Grant Miner */
"use strict";
import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';

import queryString from 'query-string';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

import Navbar from './navbar';
import Map from './map';
import Sidebar from './sidebar';
import DeviceEditor from './device-editor';
import Organization from './organization';
import Organizations from './organizations';
import OrganizationEditor from './organization-editor';
import Session from './session';
import Events from './events';
import Help from './help';
import Users from './users';
import UserEditor from './user-editor';
import Devices from './devices';
import Vehicle from './vehicle';
import Vehicles from './vehicles';
import VehicleEditor from './vehicle-editor';

export default function Root() {
  return (
    <Router>
      <div>
        <Navbar />
          <Switch>
            <Route path="/">
              <div className="container-fluid">
                <div className="row">
                  <Session />
                </div>
              </div>
            </Route>
          </Switch>
      </div>
    </Router>
  );
}

