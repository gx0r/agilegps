
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { useParams } from "react-router-dom";
import classnames from 'classnames';

import { Formik, Field } from 'formik';
import { toast } from 'react-toastify';
import { toArray, cloneDeep } from 'lodash';

import * as appState from '../appState';
import getselectvalues from "../getselectvalues";

function Fleets(props) {
  const { fleetsByID, vehiclesByID } = props;
  const [selectedFleet, selectFleet] = useState({
    name: '',
    color: 'black',
    vehicles: [],
  });
  const [availableVehicles, setAvailableVehicles] = useState(toArray(Object.keys(vehiclesByID)));
  const [selectedInFleetVehicles, setSlectedInFleetVehicles] = useState(selectedFleet ? selectedFleet.vehicles : []);

  const createFleet = () => {
    const newFleet = {
      color: 'black',
      name: 'New Fleet',
      vehicles: [],
    };
    selectFleet(newFleet);
    setSlectedInFleetVehicles(newFleet.vehicles);
  };

  const deleteFleet = () => {
    alert('tood');
  };

  const rightArrow = () => {
    console.log(availableVehicles)
    const fleet = cloneDeep(selectedFleet);
    fleet.vechicles = cloneDeep(availableVehicles);
    selectFleet(fleet);
    setSlectedInFleetVehicles(fleet.vehicles);
  };

  const leftArrow = () => {
    console.log(selectedInFleetVehicles)

    const fleet = cloneDeep(selectedFleet);
    fleet.vechicles = cloneDeep(selectedInFleetVehicles);
    selectFleet(fleet);
    setSlectedInFleetVehicles(fleet.vehicles);
  };

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
                      active: fleet.name === selectedFleet.name
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
                disabled={ !selectedFleet.name }
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
                    disabled={ !selectedFleet.name }
                    className="form-control"
                    value={ selectedFleet.name }
                    onChange={ ev => {
                      // selectedFleet.name = ev.target.value; 
                      selectFleet(Object.assign({}, selectedFleet, {name: ev.target.value}));
                    } }
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
                  availableVehicles.map(vid => <option key={ vid } value={vid} >{ vehiclesByID[vid].name }</option>)
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
                  selectedInFleetVehicles.map(vid => <option key={ vid } value={vid} >{ vehiclesByID[vid].name }</option>)
                }
              </select>
            </div>
          </div>
          <div className="buttons-right">
            <button className="btn btn-sm btn-default" onClick={ () => cancel() }>Cancel</button>
            <span> </span>
            <button
              disabled={ !selectedFleet.name || selectedFleet.name.trim() === "" }
              className="btn btn-sm btn-success" onClick={ () => save() }>Save
            </button>
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
