
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { useParams } from "react-router-dom";
import classnames from 'classnames';

import { Formik, Field } from 'formik';
import { confirmAlert } from 'react-confirm-alert';
import { toast } from 'react-toastify';
import { toArray, cloneDeep, union, without } from 'lodash';

import * as appState from '../appState';
import getselectvalues from "../getselectvalues";
import CarImage from './car';

function deleteFleet(fleet) {
  confirmAlert({
    title: 'Delete fleet',
    message: `Are you sure you want to delete fleet ${fleet.name}?`,
    buttons: [
      {
        label: 'Cancel',
      },
      {
        label: 'Delete',
        onClick: () => {
          appState.deleteFleet(fleet)
          .then(() => {
            toast.success(`Fleet ${fleet.name} deleted.`);
          })
          .catch(err => {
            toast.error(`Failed to delete fleet ${fleet.name}: ${err.message}`);
          });
        }
      }      
    ]
  });
};

function Fleets(props) {
  const { fleetsByID, selectedOrg, vehiclesByID } = props;
  const [selectedFleet, selectFleet] = useState({
    id: null,
    name: '',
    color: 'black',
    vehicles: [],
  });
  const [availableVehicles, setAvailableVehicles] = useState(toArray(Object.keys(vehiclesByID)));
  const [selectedAvailableVehicles, setSelectedAvailableVehicles] = useState([]);
  const [selectedInFleetVehicles, setSelectedInFleetVehicles] = useState(selectedFleet ? selectedFleet.vehicles : []);

  const save = (fleet) => {
    appState.saveFleet(fleet)
    .then(() => {
      toast.success(`${fleet.name} saved.`);
    })
    .catch(err => {
      toast.error(`Failed to save ${fleet.name}: ${err.message}`);
    });
  }

  const resetAvailableVehicles = () => {
    setAvailableVehicles(toArray(Object.keys(vehiclesByID)));
  }

  const createFleet = () => {
    const newFleet = {
      color: 'black',
      name: 'New Fleet',
      orgid: selectedOrg.id,
      vehicles: [],
    };
    selectFleet(newFleet);
    resetAvailableVehicles();
    setSelectedInFleetVehicles(newFleet.vehicles);
  };

  const changeColor = color => {
    selectedFleet.color = color;
  }

  const rightArrow = () => {
    // console.log(availableVehicles)
    // const fleet = cloneDeep(selectedFleet);
    // fleet.vechicles = cloneDeep(selectedAvailableVehicles);
    // selectFleet(fleet);
    // setSlectedInFleetVehicles(fleet.vehicles);
    
    let availableVehicles = toArray(Object.keys(vehiclesByID));
    while (selectedAvailableVehicles.length) {
      const vid = selectedAvailableVehicles.pop();
      const vehicle = vehiclesByID[vid];

      selectedFleet.vehicles = union(selectedFleet.vehicles, [vehicle.id]);
      availableVehicles = without(availableVehicles, vid);
    }
    setAvailableVehicles(availableVehicles);
    // setSelectedAvailableVehicles(selectedAvailableVehicles);
  };

  const leftArrow = () => {
    // console.log(selectedInFleetVehicles)

    // const fleet = cloneDeep(selectedFleet);
    // fleet.vechicles = cloneDeep(selectedInFleetVehicles);
    // selectFleet(fleet);
    // setSlectedInFleetVehicles(fleet.vehicles);
    let availableVehicles = toArray(Object.keys(vehiclesByID));
    while (selectedInFleetVehicles.length) {
      const vid = selectedInFleetVehicles.pop();
      const vehicle = vehiclesByID[vid];

      selectedFleet.vehicles = without(selectedFleet.vehicles, [vehicle.id]);
      availableVehicles = union(availableVehicles, [vid]);
    }
    setAvailableVehicles(availableVehicles);
    setSelectedInFleetVehicles(selectedFleet.vehicles);
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
                    onClick={ () => {
                      selectFleet(fleet);
                      resetAvailableVehicles();
                    } }
                  >
                     <CarImage fill={fleet.color} /> { fleet.name }
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
                onClick={ () => deleteFleet(selectedFleet) }
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
                <input type="color" onChange={ ev => changeColor(ev.target.value) } value={ selectedFleet.color } />
              </div>
            </div>
          </div>
          <div className="form-group">
            <div className="col-sm-5">
              <div>Available Vehicles</div>
              <select className="fullwidth form-control" multiple size="20"
                onChange={ ev => setSelectedAvailableVehicles(getselectvalues(ev.target)) }
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
                  onChange={ ev => setSelectedInFleetVehicles(getselectvalues(ev.target)) }
              >
                {
                  selectedFleet.vehicles.map(vid => <option key={ vid } value={vid} >{ vehiclesByID[vid].name }</option>)
                }
              </select>
            </div>
          </div>
          <div className="buttons-right">
            <button className="btn btn-sm btn-default" onClick={ () => cancel() }>Cancel</button>
            <span> </span>
            <button
              disabled={ !selectedFleet.name || selectedFleet.name.trim() === "" }
              className="btn btn-sm btn-success" onClick={ () => save(selectedFleet) }>Save
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
    selectedOrg: state.selectedOrg,
    fleetsByID: state.fleetsByID,
    vehiclesByID: state.vehiclesByID,
  })
)(Fleets);
