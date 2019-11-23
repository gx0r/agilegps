
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
import { viewNewVehicle } from "../appStateActionCreators";

function deleteVehicle(vehicle) {
  confirmAlert({
    title: 'Delete vehicle',
    message: `Are you sure you want to delete vehicle ${vehicle.name}?`,
    buttons: [
      {
        label: 'Cancel',
      },
      {
        label: 'Delete',
        onClick: () => {
          appState.deleteVehicle(vehicle)
          .then(() => {
            toast.success(`Vehicle ${vehicle.name} deleted.`);
          })
          .catch(err => {
            toast.error(`Failed to delete vehicle ${vehicle.name}: ${err.message}`);
          });
        }
      }      
    ]
  });
};

class Vehicles extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }

  render() {
    const {
      devicesByID,
      vehiclesByID,
      viewNewVehicle,
    } = this.props;

    return (
      <div>
        <div className="col-md-1" />
        <div className="col-md-10 business-table">
          <button
            className="btn btn-default"
            style={{marginBottom: '1em'}}
            onClick={ viewNewVehicle }
          >New Vehicle</button>
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>Name</th>
                <th>Device IMEI</th>
                <th>Plate</th>
                <th>VIN</th>
                <th>Operations</th>
              </tr>
            </thead>
            <tbody>
              {
                Object.keys(vehiclesByID).map(key => {
                  const vehicle = vehiclesByID[key];
                  return (
                    <tr key={ vehicle.id }>
                      <td>{ vehicle.name }</td>
                      <td className="pointer"
                        onClick={ () => appState.viewDeviceByID(vehicle.device) }
                      ><a href="#">{ vehicle.device }</a></td>
                      <td>{ vehicle.plate }</td>
                      <td>{ vehicle.vin }</td>
                      <td>
                        <a
                          className="btn btn-primary btn-sm"
                          onClick={ () => appState.viewVehicleByID(vehicle.id) }
                        ><i className="middle glyphicon glyphicon-pencil" /> Update
                        </a>
                        <span> </span>
                        <a
                          className="btn btn-primary btn-sm"
                          onClick={ () => deleteVehicle(vehicle) }
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
    vehiclesByID: state.vehiclesByID,
  }),
  {
    viewNewVehicle,
  },
)(Vehicles);
