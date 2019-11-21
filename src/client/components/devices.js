
import React, { Fragment } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as classnames from 'classnames';

import * as moment from 'moment';
import { toArray } from 'lodash';
import { toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';

import { translate as t } from "../i18n";
import * as appState from '../appState';
import { viewNewUser } from "../appStateActionCreators";
import { getVehiclesByDeviceID } from "../selectors/getVehiclesByDeviceID";

function hearbeatField(device) {
  if (!device.lastHeartbeat) {
    return null;
  }

  return (
    <><span style={{ color: 'red' }}>♥</span>{ moment(device.lastHeartbeat).fromNow() }</>
  );
}

function batteryField(device) {
  if (!device.batteryPercent) {
    return null;
  }

  return (
    <span style={{ marginLeft: '1em' }}>{ device.batteryPercent }%🔋</span>
  );
}

function deleteDevice(user) {
  confirmAlert({
    title: 'Delete user',
    message: `Are you sure you want to delete device ${device.imei}?`,
    buttons: [
      {
        label: 'Cancel',
      },
      {
        label: 'Delete',
        onClick: () => {
          appState.deleteDevice(device)
          .then(() => {
            toast.success(`Device ${device.imei} deleted.`);
          })
          .catch(err => {
            toast.error(`Failed to delete user ${device.imei} : ${err.message}`);
          });
        }
      }      
    ]
  });
};

class Devices extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }

  render() {
    const {
      devicesByID,
      vehiclesByDeviceID,
    } = this.props;

    return (
      <div>
        <div className="col-md-1" />
        <div className="col-md-10 business-table">
          <button
            className="btn btn-default"
            style={{marginBottom: '1em'}}
            onClick={ () => viewNewDevice() }
          >New Device</button>
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>IMEI</th>
                <th>SIM</th>
                <th>Organization</th>
                <th>Active</th>
                <th>Heartbeat</th>
                <th>Battery</th>
                <th>Phone</th>
                <th>Network</th>
                <th>Activation Date</th>
                <th>Associated Vehicle</th>
                <th>Operations</th>
              </tr>
            </thead>
            <tbody>
              {
                Object.keys(devicesByID).map(key => {
                  const device = devicesByID[key];
                  return (
                    <tr key={ device.imei }>
                      <td>{ device.imei }</td>
                      <td>{ device.sim }</td>
                      <td>{ appState.getOrgName(device.orgid) }</td>
                      <td>{ device.active ? "✔" : "" }</td>
                      <td>{ hearbeatField(device) }</td>
                      <td>{ batteryField(device) }</td>
                      <td>{ device.phone }</td>
                      <td>{ device.network }</td>
                      <td>
                        { device.activationDate && moment(device.activationDate).format("M/DD/YYYY") }
                      </td>
                      <td>
                        <a href="#" onClick={ () => appState.viewDeviceByID(vehiclesByDeviceID[device.imei].id) }>
                          { vehiclesByDeviceID[device.imei] && vehiclesByDeviceID[device.imei].name }
                        </a>
                      </td>
                      <td>
                        <a
                          className="btn btn-primary btn-warning "
                          onClick={ () => appState.viewDeviceByID(device.imei) }
                        ><i className="middle glyphicon glyphicon-pencil" /> Update
                        </a>
                        <span> </span>
                        <a
                          className="btn btn-primary btn-sm btn-danger"
                          onClick={ () => deleteDevice(device) }
                        ><i className="middle glyphicon glyphicon-trash" /> Delete
                        </a>
                      </td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
        </div>
        <div className="col-md-1" />
      </div>
    )
  }
}

export default connect(
  state => ({
    devicesByID: state.devicesByID,
    usersByID: state.usersByID,
    vehiclesByDeviceID: getVehiclesByDeviceID(state),
  }),
  {
    viewNewUser,
  },
)(Devices);
