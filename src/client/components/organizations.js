
import React, { Fragment } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as classnames from 'classnames';

import * as appState from '../appState';

import { toArray } from 'lodash';
import { toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';

import { viewNewOrganization } from "../appStateActionCreators";

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

function deleteOrganization(org) {
  confirmAlert({
    title: 'Delete organization',
    message: `Are you sure you want to delete organization ${org.name}?`,
    buttons: [
      {
        label: 'Cancel',
      },
      {
        label: 'Delete',
        onClick: () => {
          appState.deleteOrg(org)
          .then(() => {
            toast.success(`Org ${org.name} deleted.`);
          })
          .catch(err => {
            toast.error(`Failed to delete org ${org.name}: ${err.message}`);
          });
        }
      }      
    ]
  });
};

class Organizations extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }

  render() {
    const {
      orgsByIDarray,
      user,
      viewNewOrganization,
    } = this.props;

    return (
      <div>
        <div className="col-md-2" />
        <div className="col-md-8 business-table">
          <button
            className="btn btn-default"
            style={{marginBottom: '1em'}}
            onClick={ () => viewNewOrganization() }
          >Create Organization</button>
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
                      <Link className="btn btn-primary btn-sm"
                       to={ `/orgs/edit/${org.id} `}><i className="middle glyphicon glyphicon-pencil" /> Update</Link>
                      </td>
                      <td>
                        
                        <Link to={ `/orgs/${org.id} `}>View Org</Link>
                        <a
                          className="btn btn-primary btn-sm"
                          onClick={ () => appState.selectOrgByID(org.id)
                            .then(() => {
                              appState.viewOrgByID(org.id);
                              return Promise.delay(200);
                            })
                            .then(() => {
                              // appState.viewOrgByID(org.id);
                              appState.selectFleetAll();
                            })
                            .catch(err => {
                              toast.error(err.message);
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
    viewNewOrganization,
  }, dispatch),
)(Organizations);
