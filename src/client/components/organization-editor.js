
import * as React from 'react';
import { connect } from 'react-redux';
import * as classnames from 'classnames';
import { useParams } from "react-router-dom";

import { Formik, Field } from 'formik';
import { toast } from 'react-toastify';

import * as appState from '../appState';
import * as Organization from "../../common/models/Organization";

function OrganizationEditor(props) {
  const { orgId } = useParams();
  const { orgsByID } = props;
  const org = orgId ? orgsByID[orgId] : new Organization();

  return (
    <div>
      <div className="col-sm-3" />
      <div className="business-table col-sm-6">
        <div className="btn center">{ org.id === '' ? 'New' : 'Edit' } Organization</div>
        <Formik
          initialValues={{
            id: org.id,
            name: org.name,
            ein: org.ein,
            address1: org.address1,
            address2: org.address2,
            city: org.city,
            state: org.state,
            zip: org.zip,
            country: org.country,
          }}
          validate={values => {
            const errors = {};
            if (!values.name) {
              errors.name = 'Required';
            }
            return errors;
          }}
          onSubmit={(values, { setSubmitting }) => {
            const org = new Organization(values);
            appState.saveOrg(org)
            .then(() => {
              setSubmitting(false);
              toast.success("Org saved");
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
                <label className="col-md-2 control-label">EIN</label>
                <div className="col-md-10">
                  <Field className="form-control" name="ein" />
                </div>
              </div>
              <div className="form-group">
                <label className="col-md-2 control-label">Address Line 1</label>
                <div className="col-md-10">
                  <Field className="form-control" name="address1" />
                </div>
              </div>
              <div className="form-group">
                <label className="col-md-2 control-label">Address Line 2</label>
                <div className="col-md-10">
                  <Field className="form-control" name="address2" />
                </div>
              </div>
              <div className="form-group">
                <label className="col-md-2 control-label">City</label>
                <div className="col-md-10">
                  <Field className="form-control" name="city" />
                </div>
              </div>
              <div className="form-group">
                <label className="col-md-2 control-label">State</label>
                <div className="col-md-10">
                  <Field className="form-control" name="state" />
                </div>
              </div>
              <div className="form-group">
                <label className="col-md-2 control-label">ZIP</label>
                <div className="col-md-10">
                  <Field className="form-control" name="zip" />
                </div>
              </div>
              <div className="form-group">
                <label className="col-md-2 control-label">Country</label>
                <div className="col-md-10">
                  <Field className="form-control" name="country" />
                </div>
              </div>
              <div className="form-group">
                <label className="col-md-2 control-label">ID</label>
                <div className="col-md-10">
                  <input
                    className="form-control"
                    name="id"
                    disabled={ true }
                    onChange={ handleChange }
                    onBlur={ handleBlur }
                    value={ values.id }
                  />
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
    orgsByID: state.orgsByID,
  }),
)(OrganizationEditor);
