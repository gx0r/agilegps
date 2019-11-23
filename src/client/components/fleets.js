
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { useParams } from "react-router-dom";
import classnames from 'classnames';

import { Formik, Field } from 'formik';
import { toast } from 'react-toastify';
import { toArray } from 'lodash';

import * as appState from '../appState';
import getselectvalues from "../getselectvalues";

function Fleets(props) {
  const { fleetsByID, vehiclesByID } = props;
  const [selectedFleet, selectFleet] = useState();
  const [availableVehicles, setAvailableVehicles] = useState(toArray(vehiclesByID));
  const [selectedInFleetVehicles, setSlectedInFleetVehicles] = useState(selectedFleet ? selectedFleet.vehicles : []);

  console.log(availableVehicles)

  const createFleet = () => {
    selectFleet({});
  };

  const deleteFleet = () => {
    alert('tood');
  }

  return (
    <div className="row">
      <div className="col-sm-1" />
      <div className="col-sm-10">
        <div className="col-sm-4">
          <div className="business-table">
            <h4>Fleets</h4>
            <ul className="list-group">
            {
              Object.keys(fleetsByID).map(id => {
                const fleet = fleetsByID[id];

                return (
                  <li
                    key={ fleet.name }
                    className={ classnames('pointer', 'list-group-item', {
                      active: selectedFleet && fleet.name === selectedFleet.name
                    }) }
                    onClick={ () => selectFleet(fleet) }
                  >
                    { fleet.name }
                  </li>
                );

              })
            }
            </ul>
            <br />
            <div className="buttons-right">
              <button
                className="btn btn-sm btn-default"
                disabled={ !selectedFleet }
                onClick={ () => deleteFleet() }
              >
                Delete
              </button>
              <span> </span>
              <button
                className="btn btn-sm btn-success"
                onClick={ () => createFleet() }
              >
              Create
              </button>
            </div>
          </div>
        </div>
        <div className="col-sm-8 business-table">
          <div className="form-group col-sm-12">
            <div className="row">
              <div className="form-group col-sm-4">
                <label className="control-label">Fleet Name: </label>
                <div>
                  <input
                    disabled={ !selectedFleet }
                    className="form-control"
                  />
                </div>
              </div>
              <div className="form-group col-sm-2" />
              <div className="form-group col-sm-6">
                <label className="col-sm-2 control-label">Fleet Color:</label>
                <input type="color" onChange={ ev => changeColor(ev.target.value) } />
              </div>
            </div>
          </div>
          <div className="form-group">
            <div className="col-sm-5">
              <div>Available Vehicles</div>
              <select className="fullwidth form-control" multiple size="20"
                onBlur={ ev => selectAvailableVehicles(getselectvalues(ev.target)) }
              >
                {
                  availableVehicles.map(vehicle => <option value={vehicle.id} >{ vehicle.name }</option>)
                }
              </select>
            </div>
            <div className="col sm-2 verticalcenter"
              style={{ marginTop: '10em' }}
            >
              <button className="btn-lg btn-default" onClick={ () => rightArrow() }>→</button>
              <span> </span>
              <button className="btn-lg btn-default" onClick={ () => leftArrow() }>←</button>
            </div>
            <div className="col-sm-5">
              <div>Vehicles in Fleet</div>
              <select className="fullwidth form-control" multiple size="20"
                  onBlur={ ev => setSlectedInFleetVehicles(getselectvalues(ev.target)) }
              >
                {
                  selectedInFleetVehicles.map(vehicle => <option value={vehicle.id} >{ vehicle.name }</option>)
                }
              </select>
            </div>
          </div>
          <div className="buttons-right">
            <button className="btn btn-sm btn-default" onClick={ () => cancel() }>Cancel</button>
            <span> </span>
            <button disabled={ !selectedFleet || selectedFleet.name.trim() === "" } className="btn btn-sm btn-success" onClick={ () => save() }>Save</button>
          </div>
        </div>
      </div>
      <div className="col-sm-1" />
    </div>
  );
}

export default connect(
  state => ({
    fleetsByID: state.fleetsByID,
    vehiclesByID: state.vehiclesByID,
  })
)(Fleets);
