
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import classnames from 'classnames';
import { toArray } from 'lodash';
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
import OrgMarkers from "../markers/OrgMarkers.js";
import ClickListenerFactory from "../markers/clicklistenerfactory";

class Organization extends React.Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
    this.state = {
    }
  }

  static propTypes = {
  };

  componentDidMount() {
  }

  clickItem(item) {
    if (this.selectedItem === item) {
      this.selectedItem = {};
      ClickListenerFactory.closeInfoWindow();
    } else {
      this.selectedItem = item;
      OrgMarkers.clickMarkerByVehicleID(item.id);
    }
  }

  render() {
    const { 
      autoUpdate,
      impliedSelectedVehicles,
      selectedOrg,
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

    return (
      <div className="business-table">
        <label style={{marginRight: "0.5em"}} >
          <input type="checkbox" onClick={ ev => appState.setAutoUpdate(ev.target.checked) } />
          Auto-Update Map            
        </label>
        <label className="padrt">
          <input type="checkbox" onClick={ ev => appState.setShowVerbose(ev.target.checked) } />
          Verbose
        </label>
        <label className="padrt">
          <input type="checkbox" onClick={ ev => appState.setShowLatLong(ev.target.checked) } />
          LAT/LONG
        </label>
        <a
          className="padrt"
          style={{ cursor: 'pointer'}} >
          <img src="images/excel-icon.png" />
        </a>
        <br />
        <label>Total { impliedSelectedVehicles.length }</label>
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
              <td>Status</td>
              { verbose && <td>Online</td> }
              { verbose && <td>Battery</td> }
              <td>GPS</td>
            </tr>
          </thead>
          <tbody>
          {
            impliedSelectedVehicles.map(vehicle => {
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
                  { verbose && <td style="nowrap">{ lastStatus.b ? 'Buffered' : 'Yes' } </td> }
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
    impliedSelectedVehicles: state.impliedSelectedVehicles,
    selectedOrg: state.selectedOrg,
    showLatLong: state.showLatLong,
    user: state.user,
    verbose: state.verbose,
  }),
  dispatch => bindActionCreators({
  }, dispatch),
)(Organization);
