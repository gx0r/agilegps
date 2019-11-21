
import * as React from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as classnames from 'classnames';

import { Formik, Field } from 'formik';
import { toast } from 'react-toastify';

import * as appState from '../appState';
import * as Device from "../../common/models/Device";
import { createOrgSelector } from './orgselector';

class DeviceEditor extends React.Component {
  constructor(props) {
    super(props);
  }

  static propTypes = {
    device: PropTypes.object.isRequired,
  };

  render() {
    const { device } = this.props;

    return (
      <div>
        <div className="col-sm-3" />
        <div className="business-table col-sm-6">
          <div className="btn center">{ device.imei === '' ? 'New' : 'Edit' } Device</div>
          <Formik
            initialValues={{
              imei: device.imei,
              active: device.active,
              activationDate: device.activationDate,
              network: device.network,
              status: device.status,
              orgid: device.orgid,
              sim: device.sim,
              phone: device.phone
            }}
            validate={values => {
              // const errors = {};
              // if (!values.username) {
              //   errors.username = 'Required';
              // }
              // return errors;
            }}
            onSubmit={(values, { setSubmitting }) => {
              const device = new Device(values);
              appState.saveDevice(device)
              .then(() => {
                setSubmitting(false);
                toast.success(`Device ${device.imei} saved`);
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
                  <label className="col-md-2 control-label">IMEI</label>
                  <div className="col-md-10">
                    <Field className="form-control" name="imei" />
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
                    <Field className="form-control" name="activationDate" />
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
                    { createOrgSelector(this.props.orgsByID) }
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
}

export default connect(
  state => {
    let device;
    if (state.devicesByID[state.viewID]) {
      device = state.devicesByID[state.viewID];
    } else {
      device = new Device();
    }

    return {
      device: device,
      orgsByID: state.orgsByID,
    }
  },
)(DeviceEditor);
