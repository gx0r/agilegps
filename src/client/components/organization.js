
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import classnames from 'classnames';
import appState from '../appState';

import helpers from '../../common/helpers';
import { city, street } from "../../common/addressdisplay";
import { state as stateFormat } from "../../common/addressdisplay";
import formatDate from "../formatDate";
import hidenan from "../../common/hidenan";
import tomiles from "../tomiles";
import todir from "../../common/todir";
import isUserMetric from "../isUserMetric";
import Status from "../../common/status.js";
import tzOffset from "../tzoffset";

const RECENTLY_CHANGED = 10000;

import {
  setShowVerbose,
  setShowLatLong,
} from '../appStateActionCreators';
class Organization extends React.Component {
  constructor(props) {
    super(props);
  }

  static propTypes = {
  };

  componentDidMount() {
  }

  wasRecentlyUpdated = date => {
    date = new Date(date);
    const lastUpdated = new Date() - date < RECENTLY_CHANGED;

    if (lastUpdated) {
      Promise.delay(RECENTLY_CHANGED).then(() => {
        this.forceUpdate();
      });
    }
    return lastUpdated;
  }

  clickItem = vehicle => {
    const { selectedMapVehicleID } = this.props;

    if (vehicle.id === selectedMapVehicleID) {
      appState.selectMapVehicleID(null);
      // ClickListenerFactory.closeInfoWindow();
    } else {
      appState.selectMapVehicleID(vehicle.id);
      const state = appState.getState();
      const marker = state.markersByVehicleID[vehicle.id];
      const map = state.map;

      if (marker) {
        new google.maps.event.trigger(marker, 'click');
        // map.panTo(marker.position);
      }
    }
  }

  render() {
    const { 
      autoUpdate,
      impliedSelectedVehiclesByID,
      selectedMapVehicleID,
      selectedOrg,
      setShowLatLong,
      setShowVerbose,
      showLatLong,
      version,
      verbose,
     } = this.props;

     const getLastStatus = (vehicle) => {
      if (verbose) {
        if (vehicle.lastVerbose && vehicle.last) {
          if (
            new Date(vehicle.lastVerbose.d) >= new Date(vehicle.last.d)
          ) {
            return vehicle.lastVerbose;
          } else {
            return vehicle.last;
          }
        } else if (vehicle.lastVerbose) {
          return vehicle.lastVerbose;
        } else if (vehicle.last) {
          return vehicle.last;
        }
      } else if (vehicle.last) {
        return helpers.cleanItem(vehicle.last);
      }
     }

    const excelHref = `/api/organizations/${selectedOrg.id}/vehiclestatus?format=excel&latlong=${this.showLatLong}&verbose=${this.verbose}&tzOffset=${encodeURIComponent(tzOffset())}`;

    return (
      <div className="business-table">
        <label style={{marginRight: "0.5em"}} >
          <input
          checked={ autoUpdate }
            type="checkbox"
            onClick={ ev => appState.setAutoUpdate(ev.target.checked) }
          />
          Auto-Zoom Map            
        </label>
        <label className="padrt">
          <input
            checked={ verbose }
            type="checkbox"
            onClick={ ev => setShowVerbose(ev.target.checked) }
          />
          Verbose
        </label>
        <label className="padrt">
          <input
            checked={ showLatLong }
            type="checkbox"
            onClick={ ev => setShowLatLong(ev.target.checked) }
          />
          LAT/LONG
        </label>
        <a
          href={ excelHref }
          className="padrt"
          style={{ cursor: 'pointer'}} >
          <img src="images/excel-icon.png" />
        </a>
        <br />
        <label>Total { Object.keys(impliedSelectedVehiclesByID).length }</label>
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <td>Name</td>
              <td>Date</td>
              <td>Address</td>
              <td>City</td>
              <td>State</td>
              { verbose && <td>Odometer</td> }
              { verbose && <td>Hour Meter</td> }
              <td>Dir</td>
              <td>{ isUserMetric() ? "km/h" : "mph" }</td>
              { showLatLong && <td>Lat</td> }
              { showLatLong && <td>Long</td> }
              <td>Status</td>
              { verbose && <td>Online</td> }
              { verbose && <td>Battery</td> }
              <td>GPS</td>
            </tr>
          </thead>
          <tbody>
          {
            Object.keys(impliedSelectedVehiclesByID).map(id => {
              const vehicle = impliedSelectedVehiclesByID[id];
              const lastStatus = getLastStatus(vehicle);
              
              if (!lastStatus) {
                return (
                  <tr>
                    <td className="nowrap">{ vehicle.name }</td>
                  </tr>
                );
              }

              return (
                <tr
                  id={ vehicle.id }
                  onClick={ () => this.clickItem(vehicle) }
                  style={
                    {
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease-in-out',
                      backgroundColor: vehicle.id === selectedMapVehicleID
                      ? '#FEE0C6'
                      : this.wasRecentlyUpdated(lastStatus.d)
                      ? 'yellow'
                      : ''
                    }
                  }
                >
                  <td className="nowrap">{ vehicle.name }</td>
                  <td className="nowrap">{ lastStatus.d ? formatDate(lastStatus.d) : "" } </td>
                  <td className="nowrap">{ street(lastStatus) }</td>
                  <td className="nowrap">{ city(lastStatus) }</td>
                  <td className="nowrap">{ stateFormat(lastStatus) }</td>
                  { verbose && <td className="nowrap">{ hidenan(tomiles(lastStatus.m)) }</td> }
                  { verbose && <td className="nowrap">{ lastStatus.h }</td> }
                  <td className="nowrap">{ todir(lastStatus) }</td>
                  <td className="nowrap">{ hidenan(tomiles(lastStatus.s)) }</td>
                  { showLatLong && <td className="nowrap">{ lastStatus.la }</td> }
                  { showLatLong && <td className="nowrap">{ lastStatus.lo }</td> }
                  <td
                    style={{
                      color: Status.getStatusColor(lastStatus)
                    }}
                    className="nowrap">{ Status.getStatus(lastStatus) }</td>
                  { verbose && <td className="nowrap">{ lastStatus.b ? 'Buffered' : 'Yes' } </td> }
                  { verbose && <td className="nowrap">{ lastStatus.bp ? `${lastStatus.bp}%` : null }</td> }
                  <td className="nowrap">
                    <img src={ helpers.getAccuracyAsImg(lastStatus.g) } />
                  </td>
                </tr>
              )

            })
          }
          </tbody>
        </table>

      </div>  
    );
  }
}

export default connect(
  state => ({
    autoUpdate: state.autoUpdate,
    impliedSelectedVehiclesByID: state.impliedSelectedVehiclesByID,
    selectedOrg: state.selectedOrg,
    selectedMapVehicleID: state.selectedMapVehicleID,
    showLatLong: state.showLatLong,
    user: state.user,
    verbose: state.verbose,
  }),
  dispatch => bindActionCreators({
    setShowLatLong,
    setShowVerbose,
  }, dispatch),
)(Organization);
