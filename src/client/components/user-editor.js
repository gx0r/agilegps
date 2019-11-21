
import * as React from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as classnames from 'classnames';

import { Formik } from 'formik';
import { toast } from 'react-toastify';

import * as appState from '../appState';
import * as User from "../../common/models/User";

class UserEditor extends React.Component {
  constructor(props) {
    super(props);
  }

  static propTypes = {
    user: PropTypes.object.isRequired,
  };

  render() {
    const { user } = this.props;

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
                  <label className="col-md-2 control-label">Email</label>
                  <div className="col-md-10">
                    <input
                      className="form-control"
                      name="email"
                      onChange={ handleChange }
                      onBlur={ handleBlur }
                      value={ values.email }
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="col-md-2 control-label">Password</label>
                  <div className="col-md-10">
                    <input
                      className="form-control"
                      name="password"
                      onChange={ handleChange }
                      onBlur={ handleBlur }
                      value={ values.password }
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="col-md-2 control-label">Workphone</label>
                  <div className="col-md-10">
                    <input
                      className="form-control"
                      name="workphone"
                      onChange={ handleChange }
                      onBlur={ handleBlur }
                      value={ values.workphone }
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="col-md-2 control-label">Mobilephone</label>
                  <div className="col-md-10">
                    <input
                      className="form-control"
                      name="mobilephone"
                      onChange={ handleChange }
                      onBlur={ handleBlur }
                      value={ values.mobilephone }
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="col-md-2 control-label">Fax</label>
                  <div className="col-md-10">
                    <input
                      className="form-control"
                      name="fax"
                      onChange={ handleChange }
                      onBlur={ handleBlur }
                      value={ values.fax }
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="col-md-2 control-label">Is Admin</label>
                  <div className="col-md-10">
                    <input
                      className="form-control"
                      name="isAdmin"
                      onChange={ handleChange }
                      onBlur={ handleBlur }
                      value={ values.isAdmin }
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="col-md-2 control-label">Is Org Admin</label>
                  <div className="col-md-10">
                    <input
                      className="form-control"
                      name="isOrgAdmin"
                      onChange={ handleChange }
                      onBlur={ handleBlur }
                      value={ values.isOrgAdmin }
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="col-md-2 control-label">Org ID</label>
                  <div className="col-md-10">
                    <input
                      className="form-control"
                      name="orgid"
                      onChange={ handleChange }
                      onBlur={ handleBlur }
                      value={ values.orgid }
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="col-md-2 control-label">Advanced Mode</label>
                  <div className="col-md-10">
                    <input
                      className="form-control"
                      name="advancedMode"
                      onChange={ handleChange }
                      onBlur={ handleBlur }
                      value={ values.advancedMode }
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="col-md-2 control-label">Metric</label>
                  <div className="col-md-10">
                    <input
                      className="form-control"
                      name="metric"
                      onChange={ handleChange }
                      onBlur={ handleBlur }
                      value={ values.metric }
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
    let user;
    if (state.usersByID[state.viewID]) {
      user = state.usersByID[state.viewID];
    } else {
      user = new User();
    }

    return {
      user: user,
    }
  },
)(UserEditor);
