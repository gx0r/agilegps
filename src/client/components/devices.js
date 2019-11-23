
import React from 'react';
import { connect } from 'react-redux';
import * as classnames from 'classnames';
import { Link } from "react-router-dom";

import * as moment from 'moment';
import { toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';

import { translate as t } from "../i18n";
import * as appState from '../appState';
import { getVehiclesByDeviceID } from "../selectors/getVehiclesByDeviceID";
import * as formatDate from "../formatDate";

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

function deleteDevice(device) {
  confirmAlert({
    title: 'Delete device',
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

function Devices(props) {
  const {
    devicesByID,
    orgsByID,
    vehiclesByDeviceID,
  } = props;

  return (
    <div>
      <div className="col-md-1" />
      <div className="col-md-10 business-table">
        <Link
          className="btn btn-default"
          style={{marginBottom: '1em'}}
          to="/devices/new">Create Device</Link>
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
                const toVehicleLink = vehiclesByDeviceID[device.imei] ?
                  `/vehicle/${vehiclesByDeviceID[device.imei].id}/edit` : null;
                const toVehicleName = vehiclesByDeviceID[device.imei] && vehiclesByDeviceID[device.imei].name;
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
                      { device.activationDate && formatDate(device.activationDate) }
                    </td>
                    <td>
                      <Link to={ toVehicleLink }>
                        { toVehicleName }
                      </Link>
                    </td>
                    <td>
                      <Link className="btn btn-primary btn-warning"
                        to={ `/devices/edit/${device.imei}`}>
                          <i className="middle glyphicon glyphicon-pencil" /> Update</Link>
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

export default connect(
  state => ({
    devicesByID: state.devicesByID,
    orgsByID: state.orgsByID,
    usersByID: state.usersByID,
    vehiclesByDeviceID: getVehiclesByDeviceID(state),
  })
)(Devices);
