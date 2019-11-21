
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import classnames from 'classnames';

import { Formik } from 'formik';
import { toast } from 'react-toastify';

import * as appState from '../appState';
import * as Organization from "../../common/models/Organization";

class OrganizationEditor extends React.Component {
  constructor(props) {
    super(props);
  }

  static propTypes = {
    org: PropTypes.object.isRequired,
  };

  render() {
    const { org } = this.props;

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
                    { errors.name && touched.name && errors.name }
                    <input
                      className="form-control"
                      name="name"
                      onChange={ handleChange }
                      onBlur={ handleBlur }
                      value={ values.name }
                    />                    
                  </div>
                </div>
                <div className="form-group">
                  <label className="col-md-2 control-label">EIN</label>
                  <div className="col-md-10">
                    <input
                      className="form-control"
                      name="ein"
                      onChange={ handleChange }
                      onBlur={ handleBlur }
                      value={ values.ein }
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="col-md-2 control-label">Address Line 1</label>
                  <div className="col-md-10">
                    <input
                      className="form-control"
                      name="address1"
                      onChange={ handleChange }
                      onBlur={ handleBlur }
                      value={ values.address1 }
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="col-md-2 control-label">Address Line 2</label>
                  <div className="col-md-10">
                    <input
                      className="form-control"
                      name="address2"
                      onChange={ handleChange }
                      onBlur={ handleBlur }
                      value={ values.address2 }
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="col-md-2 control-label">City</label>
                  <div className="col-md-10">
                    <input
                      className="form-control"
                      name="city"
                      onChange={ handleChange }
                      onBlur={ handleBlur }
                      value={ values.city }
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="col-md-2 control-label">State</label>
                  <div className="col-md-10">
                    <input
                      className="form-control"
                      name="state"
                      onChange={ handleChange }
                      onBlur={ handleBlur }
                      value={ values.state }
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="col-md-2 control-label">ZIP</label>
                  <div className="col-md-10">
                    <input
                      className="form-control"
                      name="zip"
                      onChange={ handleChange }
                      onBlur={ handleBlur }
                      value={ values.zip }
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="col-md-2 control-label">Country</label>
                  <div className="col-md-10">
                    <input
                      className="form-control"
                      name="country"
                      onChange={ handleChange }
                      onBlur={ handleBlur }
                      value={ values.country }
                    />
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
    const { orgsByID, subview, viewID } = state;
    let org;
    if (subview === 'NEW') {
      org = new Organization();
    } else {
      org = orgsByID[viewID];
    }

    return {
      org: org,
    }
  },
  dispatch => bindActionCreators({
  }, dispatch),
)(OrganizationEditor);
