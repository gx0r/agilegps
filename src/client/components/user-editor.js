
import * as React from 'react';
import { connect } from 'react-redux';
import { useParams } from "react-router-dom";

import { Formik, Field } from 'formik';
import { toast } from 'react-toastify';

import * as appState from '../appState';
import * as User from "../../common/models/User";

import { createOrgSelector } from './orgselector';

function UserEditor(props) {
  const { orgsByID, usersByID } = props;

  const { userId } = useParams();
  let user;
  if (userId) {
    user = usersByID[userId];
  } else {
    user = new User();
  }

  return (
    <div>
      <div className="col-sm-3" />
      <div className="business-table col-sm-6">
        <div className="btn center">{ user.username === '' ? 'New' : 'Edit' } User</div>
        <Formik
          initialValues={{
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            password: user.password,
            workphone: user.workphone,
            mobilephone: user.mobilephone,
            fax: user.fax,
            isAdmin: user.isAdmin,
            isOrgAdmin: user.isOrgAdmin,
            orgid: user.orgid,
            advancedMode: user.advancedMode,
            metric: user.metric,            
          }}
          validate={values => {
            const errors = {};
            if (!values.username) {
              errors.username = 'Required';
            }
            return errors;
          }}
          onSubmit={(values, { setSubmitting }) => {
            const user = new User(values);
            appState.saveUser(user)
            .then(() => {
              setSubmitting(false);
              toast.success(`User ${user.username} saved`);
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
                <label className="col-md-2 control-label">Username</label>
                <div className="col-md-10">
                { errors.username && touched.username && errors.username }
                  <input
                    className="form-control"
                    name="username"
                    onChange={ handleChange }
                    onBlur={ handleBlur }
                    value={ values.username }
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="col-md-2 control-label">First Name</label>
                <div className="col-md-10">
                  <input
                    className="form-control"
                    name="firstname"
                    onChange={ handleChange }
                    onBlur={ handleBlur }
                    value={ values.firstname }
                  />                    
                </div>
              </div>
              <div className="form-group">
                <label className="col-md-2 control-label">Last Name</label>
                <div className="col-md-10">
                  <input
                    className="form-control"
                    name="lastname"
                    onChange={ handleChange }
                    onBlur={ handleBlur }
                    value={ values.lastname }
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="col-md-2 control-label">Email</label>
                <div className="col-md-10">
                  <Field className="form-control" name="email" />
                </div>
              </div>
              <div className="form-group">
                <label className="col-md-2 control-label">Password</label>
                <div className="col-md-10">
                  <Field className="form-control" name="password" />
                </div>
              </div>
              <div className="form-group">
                <label className="col-md-2 control-label">Workphone</label>
                <div className="col-md-10">
                  <Field className="form-control" name="workphone" />
                </div>
              </div>
              <div className="form-group">
                <label className="col-md-2 control-label">Mobilephone</label>
                <div className="col-md-10">
                  <Field className="form-control" name="mobilePhone" />
                </div>
              </div>
              <div className="form-group">
                <label className="col-md-2 control-label">Fax</label>
                <div className="col-md-10">
                  <Field className="form-control" name="fax" />
                </div>
              </div>
              <div className="form-group">
                <label className="col-md-2 control-label">Is Admin</label>
                <div className="col-md-10">
                  <Field className="form-control" type="checkbox" name="isAdmin" />
                </div>
              </div>
              
              <div className="form-group">
                <label className="col-md-2 control-label">Is Org Admin</label>
                <div className="col-md-10">
                  <Field className="form-control" type="checkbox" name="isOrgAdmin" />
                </div>
              </div>
              <div className="form-group">
                <label className="col-md-2 control-label">Org ID</label>
                <div className="col-md-10">
                  { createOrgSelector(orgsByID) }
                </div>
              </div>
              <div className="form-group">
                <label className="col-md-2 control-label">Advanced Mode</label>
                <div className="col-md-10">
                  <Field className="form-control" type="checkbox" name="advancedMode" />
                </div>
              </div>
              <div className="form-group">
                <label className="col-md-2 control-label">Metric</label>
                <div className="col-md-10">
                  <Field className="form-control" type="checkbox" name="metric" />
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
    usersByID: state.usersByID,
  }),
)(UserEditor);
