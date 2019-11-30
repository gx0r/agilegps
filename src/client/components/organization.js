
import * as React from 'react';
import { connect } from 'react-redux';

import { delay } from 'bluebird';
import { useParams } from "react-router-dom";

import * as helpers from '../../common/helpers';
import { city, street } from "../../common/addressdisplay";
import { state as stateFormat } from "../../common/addressdisplay";
import * as formatDate from "../formatDate";
import * as hidenan from "../../common/hidenan";
import * as tomiles from "../tomiles";
import * as todir from "../../common/todir";
import * as isUserMetric from "../isUserMetric";
import * as Status from "../../common/status.js";
import * as tzOffset from "../tzoffset";
import { useForceUpdate} from './useforceupdate.js';

const RECENTLY_CHANGED = 10000;

import {
  setAutoUpdate,
  selectMapVehicleId,
  setShowVerbose,
  setShowLatLong,
} from '../appStateActionCreators';


function Organization({ 
  autoUpdate,
  impliedSelectedVehiclesByID,
  markersByVehicleID,
  selectMapVehicleId,
  selectedMapVehicleID,
  setAutoUpdate,
  setShowLatLong,
  setShowVerbose,
  showLatLong,
  version,
  verbose,
  }) {
  const { orgId } = useParams();
  const forceUpdate = useForceUpdate();

  const wasRecentlyUpdated = date => {
    date = new Date(date);
    const lastUpdated = new Date() - date < RECENTLY_CHANGED;

    if (lastUpdated) {
      delay(RECENTLY_CHANGED).then(() => {
        forceUpdate();
      });
    }
    return lastUpdated;
  }

  const clickItem = vehicle => {
    if (vehicle.id === selectedMapVehicleID) {
      selectMapVehicleId(null);
      // ClickListenerFactory.closeInfoWindow();
    } else {
      selectMapVehicleId(vehicle.id);
      const marker = markersByVehicleID[vehicle.id];

      if (marker) {
        new google.maps.event.trigger(marker, 'click');
        // map.panTo(marker.position);
      }
    }
  }

  const getLastStatus = vehicle => {
    if (!vehicle) {
      return null;
    }

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

  const excelHref = `/api/organizations/${orgId}/vehiclestatus?format=excel&latlong=${showLatLong}&verbose=${verbose}&tzOffset=${encodeURIComponent(tzOffset())}`;

  return (
    <div className="business-table">
      <label style={{marginRight: "0.5em"}} >
        <input
          checked={ autoUpdate }
          type="checkbox"
          onChange={ ev => setAutoUpdate(ev.target.checked) }
        />
        Auto-Zoom Map            
      </label>
      <label className="padrt">
        <input
          checked={ verbose }
          type="checkbox"
          onChange={ ev => setShowVerbose(ev.target.checked) }
        />
        Verbose
      </label>
      <label className="padrt">
        <input
          checked={ showLatLong }
          type="checkbox"
          onChange={ ev => setShowLatLong(ev.target.checked) }
        />
        LAT/LONG
      </label>
      <a
        href={ excelHref }
        className="padrt"
        style={{ cursor: 'pointer'}} >
        <img src="/images/excel-icon.png" />
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
            
            if (!vehicle) {
              return null;
            }
            
            if (!lastStatus) {
              return (
                <tr key={ vehicle.id }>
                  <td className="nowrap">{ vehicle.name }</td>
                </tr>
              );
            }

            return (
              <tr
                id={ vehicle.id }
                key={ vehicle.id }
                onClick={ () => clickItem(vehicle) }
                style={
                  {
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease-in-out',
                    backgroundColor: vehicle.id === selectedMapVehicleID
                    ? '#FEE0C6'
                    : wasRecentlyUpdated(lastStatus.d)
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

export default connect(
  state => ({
    autoUpdate: state.autoUpdate,
    impliedSelectedVehiclesByID: state.impliedSelectedVehiclesByID,
    map: state.map,
    markersByVehicleID: state.markersByVehicleID,
    selectedMapVehicleID: state.selectedMapVehicleID,
    showLatLong: state.showLatLong,
    user: state.user,
    verbose: state.verbose,
  }),
  {
    setAutoUpdate,
    selectMapVehicleId,
    setShowLatLong,
    setShowVerbose,
  },
)(Organization);
