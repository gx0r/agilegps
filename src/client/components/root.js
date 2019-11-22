// /* Copyright (c) 2016 Grant Miner */
"use strict";
import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';

import queryString from 'query-string';

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

class Root extends React.Component {
  constructor(props) {
    super(props);
    this.mapRef = React.createRef();
  }

  renderView() {
    const { selectedVehicle, subview, view, viewID} = this.props;

    if (view === 'SESSION') {
      return (
        <div className="container-fluid">
          <div className="row">
            <Session />
          </div>
        </div>
      )
    }

    if (view === 'EVENTS') {
      return (
        <Events />
      )
    }
    if (view === 'RAWEVENTS') {
      return (
        <Events />
      )
    }
    if (view === 'EXCEPTIONS') {
      return (
        <Events />
      )
    }

    if (view === 'ORG' && subview === 'ALL') {
      return (
        <div className="container-fluid">
          <div className="row">
            <Organizations />
          </div>
        </div>
      );
    }
    if (view === 'USER' && subview === 'ALL') {
      return (
        <div className="container-fluid">
          <div className="row">
            <Users />
          </div>
        </div>
      );
    }
    if (view === 'DEVICE' && subview === 'ALL') {
      return (
        <div className="container-fluid">
          <div className="row">
            <Devices />
          </div>
        </div>
      );
    }
    if (view === 'ORG' && subview === 'REPORT') {
      return (
        <div className="container-fluid">
          <div className="row">
            TODO
            {/* <Reports /> */}
          </div>
        </div>
      );
    }
    if (view === 'ORG' && (subview === 'NEW' || subview === 'EDIT')) {
      return (
        <div className="container-fluid">
          <div className="row">
            <OrganizationEditor />
          </div>
        </div>
      );
    }
    if (view === 'USER' && (subview === 'NEW' || subview === 'EDIT')) {
      return (
        <div className="container-fluid">
          <div className="row">
            <UserEditor />
          </div>
        </div>
      );
    }
    if (view === 'DEVICE' && (subview === 'NEW' || subview === 'EDIT')) {
      return (
        <div className="container-fluid">
          <div className="row">
            <DeviceEditor />
          </div>
        </div>
      );
    }
    if (view === 'VEHICLE' && (subview === 'NEW' || subview === 'EDIT')) {
      return (
        <div className="container-fluid">
          <div className="row">
            <VehicleEditor />
          </div>
        </div>
      );
    }
    if (view === 'USER' && subview === 'ORG') {
      return (
        <div className="container-fluid">
          <div className="row">
            <Users />
          </div>
        </div>
      );
    }

    if (view === 'FLEET' && subview === 'ORG') {
      return (
        <div className="container-fluid">
          <div className="row">
            TODO
            {/* <Fleets /> */}
          </div>
        </div>
      );
    }

    if (view === 'VEHICLE' && subview === 'ORG') {
      return (
        <div className="container-fluid">
          <div className="row">
            <Vehicles />
          </div>
        </div>
      );
    }

    if (view === 'HELP') {
      return <Help />
    }

    let lowerView = null;
    if (selectedVehicle) {
      lowerView = <Vehicle />;
    } else {
      lowerView = <Organization />;
    }

    return (
      <Fragment>
        <div className="container-fluid">
          <div className="row">
            <div className="sidebar col-sm-2">
              <Sidebar />
            </div>
            <div className="col-sm-10">
              <div className="shadow">
                <Map />
              </div>
              <br />
              { lowerView }
            </div>            
          </div>
        </div>
      </Fragment>
    );
  }

  render() {
    return (
      <div>
        <Navbar />
        { this.renderView() }
      </div>
    );
  }
}

export default connect(
  state => ({
    user: state.user,
    selectedVehicle: state.selectedVehicle,
    subview: state.subview,
    view: state.view,
    viewID: state.viewID,
  }),
  dispatch => bindActionCreators({
  }, dispatch),
)(Root);
