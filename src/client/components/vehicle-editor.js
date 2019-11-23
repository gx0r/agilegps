
import * as React from 'react';
import { connect } from 'react-redux';
import { useParams } from "react-router-dom";

import { Formik, Field } from 'formik';
import { toast } from 'react-toastify';

import * as appState from '../appState';
import * as Vehicle from "../../common/models/Vehicle";
import { createOrgSelector } from './orgselector';

function VehicleEditor(props) {
  const { orgsByID, vehiclesByID } = props;

  const { vehicleId } = useParams();
  let vehicle;
  if (vehicleId) {
    vehicle = vehiclesByID[vehicleId];
  } else {
    vehicle = new Vehicle();
  }

  return (
    <div>
      <div className="col-sm-3" />
      <div className="business-table col-sm-6">
        <div className="btn center">{ vehicle.id === '' ? 'New' : 'Edit' } Vehicle</div>
        <Formik
          initialValues={{
            id: vehicle.id,
            name: vehicle.name,
            plate: vehicle.plate,
          }}
          validate={values => {
            // const errors = {};
            // if (!values.username) {
            //   errors.username = 'Required';
            // }
            // return errors;
          }}
          onSubmit={(values, { setSubmitting }) => {
            const vehicle = new Vehicle(values);
            appState.saveVehicle(vehicle)
            .then(() => {
              setSubmitting(false);
              toast.success(`Vehicle ${vehicle.name} saved`);
              window.history.back();
            })
            .catch(err => {
              setSubmitting(false);
              toast.error(err.message);
            });
          }}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting,
          }) => (
            <form className="form-horizontal" onSubmit={ handleSubmit }>
              <div className="form-group">
                <label className="col-md-2 control-label">Name</label>
                <div className="col-md-10">
                  <Field className="form-control" name="name" />
                </div>
              </div>
              <div className="form-group">
                <label className="col-md-2 control-label">Plate</label>
                <div className="col-md-10">
                  <Field className="form-control" name="plate" />
                </div>
              </div>
              <div className="form-group">
                <label className="col-md-2 control-label">Active</label>
                <div className="col-md-10">
                  <Field className="form-control" type="checkbox" name="active" />
                </div>
              </div>
              <div className="form-group">
                <label className="col-md-2 control-label">Activation Date</label>
                <div className="col-md-10">
                  <Field className="form-control" name="activationDate" />
                </div>
              </div>
              <div className="form-group">
                <label className="col-md-2 control-label">SIM</label>
                <div className="col-md-10">
                  <Field className="form-control" name="sim" />
                </div>
              </div>
              <div className="form-group">
                <label className="col-md-2 control-label">Phone</label>
                <div className="col-md-10">
                  <Field className="form-control" name="phone" />
                </div>
              </div>                  
              <div className="form-group">
                <label className="col-md-2 control-label">Network Provider (Carrier)</label>
                <div className="col-md-10">
                  <Field className="form-control" name="network" />
                </div>
              </div>
              <div className="form-group">
                <label className="col-md-2 control-label">Status</label>
                <div className="col-md-10">
                  <Field className="form-control" name="status" />
                </div>
              </div>                
              <div className="form-group">
                <label className="col-md-2 control-label">Organization ID</label>
                <div className="col-md-10">
                  { createOrgSelector(orgsByID) }
                </div>
              </div>                
              <div className="buttons-right">
                <button
                  className="btn btn-default"
                  onClick={ ev => {
                    ev.preventDefault();
                    window.history.back();
                  } }
                >Cancel</button>
                <button
                  className="btn btn-success"
                  disabled={ isSubmitting }
                  type="submit"
                >
                    Save
                </button>
              </div>
            </form>
          )}
        </Formik>          
      </div>
      <div className="col-sm-3" />
    </div>
  );
}

export default connect(
  state => ({
    orgsByID: state.orgsByID,
    vehiclesByID: state.vehiclesByID,
  }),
)(VehicleEditor);
