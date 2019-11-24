
import React from 'react';
import { connect } from 'react-redux';
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";

import { toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';

import { translate as t } from "../i18n";
import * as appState from '../appState';

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

function Vehicles({ devicesByID, vehiclesByID }) {
  const { orgId } = useParams();

  return (
    <div>
      <div className="col-md-1" />
      <div className="col-md-10 business-table">
        <Link to={`/org/${orgId}/vehicle/new`}
          className="btn btn-default"
          style={{marginBottom: '1em'}}
        >New Vehicle</Link>
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
                    ><Link to={ `/devices/edit/${vehicle.device}` }>{ vehicle.device }</Link></td>
                    <td>{ vehicle.plate }</td>
                    <td>{ vehicle.vin }</td>
                    <td>
                      <Link className="btn btn-primary btn-sm"
                        to={ `/org/${orgId}/vehicle/${vehicle.id}/edit` }>
                          <i className="middle glyphicon glyphicon-pencil" /> Update</Link>
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

export default connect(
  state => ({
    devicesByID: state.devicesByID,
    vehiclesByID: state.vehiclesByID,
  }),
)(Vehicles);
