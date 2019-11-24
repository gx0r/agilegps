// /* Copyright (c) 2016 Grant Miner */
"use strict";
import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  useParams
} from "react-router-dom";

import Navbar from './navbar';
import Map from './map';
import Sidebar from './sidebar';
import DeviceEditor from './device-editor';
import Organization from './organization';
import Organizations from './organizations';
import OrganizationEditor from './organization-editor';
import Reports from './reports';
import Session from './session';
import Events from './events';
import Fleets from './fleets';
import Help from './help';
import Users from './users';
import UserEditor from './user-editor';
import Devices from './devices';
import Vehicle from './vehicle';
import Vehicles from './vehicles';
import VehicleEditor from './vehicle-editor';

import { loadOrgState } from '../appState';

function EnsureRouteOrgLoaded() {
  const { orgId } = useParams();

  useEffect(() => {
    // selectFleetAll()
    loadOrgState(orgId)
    // .then(selectFleetAll);
  });

  return null;
}

function Root(props) {

  const { selectedVehicle } = props;

  const renderVehicleOrOrg = () => selectedVehicle ? <Vehicle /> : <Organization />;

  return (
    <Router>
      <div>
        <Switch>
          <Route path="/help">
            <Navbar />
            <div className="container-fluid">
              <div className="row">
                <Help />
              </div>
            </div>
          </Route>
          <Route path="/orgs/new">
            <Navbar />
            <div className="container-fluid">
              <div className="row">
                <OrganizationEditor />
              </div>
            </div>
          </Route>
          <Route path="/orgs/edit/:orgId">
            <Navbar />
            <div className="container-fluid">
              <div className="row">
                <OrganizationEditor />
              </div>
            </div>
          </Route>
          <Route path="/org/:orgId/users">
            <Navbar />
            <div className="container-fluid">
                <div className="row">
                  <Users />
              </div>
            </div>
          </Route>
          <Route path="/vehicle/new">
            <Navbar />
            <div className="container-fluid">
                <div className="row">
                  <VehicleEditor />
              </div>
            </div>
          </Route>
          <Route path="/vehicle/:vehicleId/edit">
            <Navbar />
            <div className="container-fluid">
                <div className="row">
                  <VehicleEditor />
              </div>
            </div>
          </Route>
          <Route path="/org/:orgId/fleets">
            <Navbar />
            <div className="container-fluid">
              <Fleets />
            </div>
          </Route>
          <Route path="/org/:orgId/reports">
            <Navbar />
            <div className="container-fluid">
              <div className="row">
                <div className="sidebar col-sm-2">
                  <Sidebar />
                </div>
                <div className="col-sm-10">
                  <Reports />
                  <div className="shadow">
                  </div>
                </div>            
              </div>
            </div>
          </Route>
          <Route path="/org/:orgId/vehicles">
            <Navbar />
            <div className="container-fluid">
                <div className="row">
                  <Vehicles />
              </div>
            </div>
          </Route>
          <Route path="/org/:orgId/map">
            <Navbar />
            <div className="container-fluid">
              <div className="row">
                <div className="sidebar col-sm-2">
                  <Sidebar />
                </div>
                <div className="col-sm-10">
                  <div className="shadow">
                    <Map split={ false } />
                  </div>
                  <br />
                  { renderVehicleOrOrg() }
                </div>            
              </div>
            </div>
          </Route>
          <Route path="/org/:orgId">
            <EnsureRouteOrgLoaded />
            <Navbar />
            <div className="container-fluid">
              <div className="row">
                <div className="sidebar col-sm-2">
                  <Sidebar />
                </div>
                <div className="col-sm-10">
                  <div className="shadow">
                    <Map split={ true } />
                  </div>
                  <br />
                  { renderVehicleOrOrg() }
                </div>            
              </div>
            </div>
          </Route>
          <Route path="/orgs">
            <EnsureRouteOrgLoaded />
            <Navbar />
            <div className="container-fluid">
              <div className="row">
                <Organizations />
              </div>
            </div>
          </Route>
          <Route path="/devices/new">
            <Navbar />
            <div className="container-fluid">
              <div className="row">
                <DeviceEditor />
              </div>
            </div>
          </Route>
          <Route path="/devices/edit/:deviceId">
            <Navbar />
            <div className="container-fluid">
              <div className="row">
                <DeviceEditor />
              </div>
            </div>
          </Route>
          <Route path="/devices">
            <Navbar />
            <div className="container-fluid">
              <div className="row">
                <Devices />
              </div>
            </div>
          </Route>
          <Route path="/users/new">
            <Navbar />
            <div className="container-fluid">
              <div className="row">
                <UserEditor />
              </div>
            </div>
          </Route>
          <Route path="/users/edit/:userId">
            <Navbar />
            <div className="container-fluid">
              <div className="row">
                <UserEditor />
              </div>
            </div>
          </Route>
          <Route path="/users">
            <Navbar />
            <div className="container-fluid">
              <div className="row">
                <Users />
              </div>
            </div>
          </Route>
          <Route path="/processed_messages">
            <Navbar />
            <div className="container-fluid">
              <div className="row">
                <Events type="events" />
              </div>
            </div>
          </Route>
          <Route path="/raw_messages">
            <Navbar />
            <div className="container-fluid">
              <div className="row">
                <Events type="rawevents" />
              </div>
            </div>
          </Route>
          <Route path="/exceptions">
            <Navbar />
            <div className="container-fluid">
              <div className="row">
                <Events type="exceptions" />
              </div>
            </div>
          </Route>
          <Route path="/">
            <Navbar />
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


export default connect(
  state => ({
    selectedVehicle: state.selectedVehicle,
  })
)(Root);
