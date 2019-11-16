
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import classnames from 'classnames';

import appState from '../appState';

import { toArray } from 'lodash';
import { toast } from 'react-toastify';

function deleteOrganization(org) {
  const result = window.confirm(
    "Are you sure you want to delete organization " + org.name + "?"
  );

  if (result === true) {
    appState.deleteOrg(org)
    .then(() => {
      toast.success(`Org ${org.name} deleted.`);
    })
    .catch(err => {
      toast.error(`Failed to delete org ${org.name}: ${err.message}`);
    });
  }
};

class Organizations extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }

  render() {
    const { orgsByIDarray, user } = this.props;

    return (
      <div>
        <div className="col-md-2" />
        <div className="col-md-8 business-table">
          <button className="btn btn-default" style={{marginBottom: '1em'}}>Create Organization</button>
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>Name</th>
                <th></th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {
                orgsByIDarray.map(org => {
                  return (
                    <tr key={ org.id }>
                      <td>{ org.name }</td>
                      <td>
                        <a
                          className="btn btn-primary btn-sm"
                          onClick={ () => appState.editOrganization(org.id) }
                        ><i className="middle glyphicon glyphicon-pencil" /> Update
                        </a>
                      </td>
                      <td>
                        <a
                          className="btn btn-primary btn-sm"
                          onClick={ () => appState.selectOrgByID(org.id)
                            .then(() => {
                              appState.viewOrgByID(org.id);
                            }) 
                          }
                        ><i className="middle glyphicon glyphicon-searcb" /> Log In
                        </a>
                      </td>
                      <td>
                        <a
                          className="btn btn-primary btn-sm"
                          onClick={ () => deleteOrganization(org) }
                        ><i className="middle glyphicon glyphicon-trash" /> Delete
                        </a>
                      </td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
        </div>
        <div className="col-md-3" />
      </div>
    )
  }
}

export default connect(
  state => ({
    orgsByID: state.orgsByID,
    orgsByIDarray: toArray(state.orgsByID),
  }),
  dispatch => bindActionCreators({
  }, dispatch),
)(Organizations);
