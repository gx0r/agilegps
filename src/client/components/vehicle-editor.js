
import * as React from 'react';
import { connect } from 'react-redux';
import { useParams } from "react-router-dom";

import { Formik, Field } from 'formik';
import { toast } from 'react-toastify';

import * as appState from '../appState';
import * as Vehicle from "../../common/models/Vehicle";
import { createOrgSelector } from './orgselector';
import { createDeviceSelector } from './deviceselector';

function VehicleEditor(props) {
  const { devicesByID, orgsByID, selectedOrg, vehiclesByID } = props;

  const { vehicleId } = useParams();
  let vehicle;
  if (vehicleId) {
    vehicle = vehiclesByID[vehicleId];
  } else {
    vehicle = new Vehicle();
    vehicle.orgid = selectedOrg && selectedOrg.id;
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
            device: vehicle.device,
            orgid: vehicle.orgid,
            odometer: vehicle.odometer,
            engineHours: vehicle.engineHours,
            vin: vehicle.vin,
            plate: vehicle.plate,
            installLocation: vehicle.installLocation,
            hookedAsset: vehicle.hookedAsset,
            document: vehicle.document,
            seat: vehicle.seat,
            length: vehicle.length,
            width: vehicle.width,
            height: vehicle.height,
            gvWeight: vehicle.gvWeight,
            gcWeight: vehicle.gcWeight,
            axies: vehicle.axies,
            hazardLevel: vehicle.hazardLevel,
            navigationKey: vehicle.navigationKey,
            navigationNumber: vehicle.navigationNumber,
            disableHos: vehicle.disableHos,
            forceMessageReadStatus: vehicle.forceMessageReadStatus,
            enableAssignedDriverIgnition: vehicle.enableAssignedDriverIgnition,
            enableTollFuelTab: vehicle.enableTollFuelTab,
            allowCoDriving: vehicle.allowCoDriving,
            driverLoginEnforced: vehicle.driverLoginEnforced,
            enableFuelSensor: vehicle.enableFuelSensor,
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

            const save = vehicle.id ? appState.putVehicle(vehicle) : appState.postVehicle(vehicle); // todo unify
            save
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
                <label className="col-md-2 control-label">Link To Device IMEI</label>
                <div className="col-md-10">
                  { createDeviceSelector(devicesByID, vehicle.device, selectedOrg.id ) }
                </div>
              </div>
              <div className="form-group">
                <label className="col-md-2 control-label">Organization ID</label>
                <div className="col-md-10">
                  { createOrgSelector(orgsByID, selectedOrg && selectedOrg.id) }
                </div>
              </div>
              <div className="form-group">
                <label className="col-md-2 control-label">Odometer</label>
                <div className="col-md-10">
                  <Field className="form-control" name="odometer" />
                </div>
              </div>
              <div className="form-group">
                <label className="col-md-2 control-label">Engine Hours</label>
                <div className="col-md-10">
                  <Field className="form-control" name="engineHours" />
                </div>
              </div>
              <hr />
              <div className="form-group">
                <label className="col-md-2 control-label">VIN</label>
                <div className="col-md-10">
                  <Field className="form-control" name="vin" />
                </div>
              </div>
              <div className="form-group">
                <label className="col-md-2 control-label">Plate</label>
                <div className="col-md-10">
                  <Field className="form-control" name="plate" />
                </div>
              </div>
              <div className="form-group">
                <label className="col-md-2 control-label">Install Loation</label>
                <div className="col-md-10">
                  <Field className="form-control" name="installLocation" />
                </div>
              </div>
              <div className="form-group">
                <label className="col-md-2 control-label">Hooked Asset</label>
                <div className="col-md-10">
                  <Field className="form-control" name="hookedAsset" />
                </div>
              </div>
              <div className="form-group">
                <label className="col-md-2 control-label">Seat</label>
                <div className="col-md-10">
                  <Field className="form-control" name="seat" />
                </div>
              </div>
              <div className="form-group">
                <label className="col-md-2 control-label">Length</label>
                <div className="col-md-10">
                  <Field className="form-control" name="length" />
                </div>
              </div>
              <div className="form-group">
                <label className="col-md-2 control-label">Width</label>
                <div className="col-md-10">
                  <Field className="form-control" name="width" />
                </div>
              </div>
              <div className="form-group">
                <label className="col-md-2 control-label">Height</label>
                <div className="col-md-10">
                  <Field className="form-control" name="height" />
                </div>
              </div>
              <div className="form-group">
                <label className="col-md-2 control-label">GV Weight</label>
                <div className="col-md-10">
                  <Field className="form-control" name="gvWeight" />
                </div>
              </div>
              <div className="form-group">
                <label className="col-md-2 control-label">GC Weight</label>
                <div className="col-md-10">
                  <Field className="form-control" name="gcWeight" />
                </div>
              </div>
              <div className="form-group">
                <label className="col-md-2 control-label">axies</label>
                <div className="col-md-10">
                  <Field className="form-control" name="axies" />
                </div>
              </div>
              <div className="form-group">
                <label className="col-md-2 control-label">hazardLevel</label>
                <div className="col-md-10">
                  <Field className="form-control" name="hazardLevel" />
                </div>
              </div>
              <div className="form-group">
                <label className="col-md-2 control-label">navigationKey</label>
                <div className="col-md-10">
                  <Field className="form-control" name="navigationKey" />
                </div>
              </div>
              <div className="form-group">
                <label className="col-md-2 control-label">navigationNumber</label>
                <div className="col-md-10">
                  <Field className="form-control" name="navigationNumber" />
                </div>
              </div>
              <div className="form-group">
                <label className="col-md-2 control-label">disableHos</label>
                <div className="col-md-10">
                  <Field className="form-control" name="disableHos" />
                </div>
              </div>
              <div className="form-group">
                <label className="col-md-2 control-label">forceMessageReadStatus</label>
                <div className="col-md-10">
                  <Field className="form-control" name="forceMessageReadStatus" />
                </div>
              </div>
              <div className="form-group">
                <label className="col-md-2 control-label">enableAssignedDriverIgnition</label>
                <div className="col-md-10">
                  <Field className="form-control" name="enableAssignedDriverIgnition" />
                </div>
              </div>
              <div className="form-group">
                <label className="col-md-2 control-label">enableTollFuelTab</label>
                <div className="col-md-10">
                  <Field className="form-control" name="enableTollFuelTab" />
                </div>
              </div>
              <div className="form-group">
                <label className="col-md-2 control-label">allowCoDriving</label>
                <div className="col-md-10">
                  <Field className="form-control" name="allowCoDriving" />
                </div>
              </div>
              <div className="form-group">
                <label className="col-md-2 control-label">driverLoginEnforced</label>
                <div className="col-md-10">
                  <Field className="form-control" name="driverLoginEnforced" />
                </div>
              </div>
              <div className="form-group">
                <label className="col-md-2 control-label">enableFuelSensor</label>
                <div className="col-md-10">
                  <Field className="form-control" name="enableFuelSensor" />
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
                <span> </span>
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
    devicesByID: state.devicesByID,
    orgsByID: state.orgsByID,
    selectedOrg: state.selectedOrg,
    vehiclesByID: state.vehiclesByID,
  }),
)(VehicleEditor);
