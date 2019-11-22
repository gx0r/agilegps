
import React, { Fragment } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as classnames from 'classnames';

import * as appState from '../appState';

import { toArray } from 'lodash';
import { toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';

import { getRelevantUsers } from '../selectors/getUsers.js';
import { viewNewUser } from "../appStateActionCreators";
import { translate as t } from "../i18n";

function getSecurtyLevel(user) {
  if (user == null) {
    return t("User");
  }
  if (user.isAdmin && user.isOrgAdmin) {
    return t("Site Admin and Organization Admin");
  }
  if (user.isAdmin) {
    return t("Site Admin");
  }
  if (user.isOrgAdmin) {
    return t("Organization Admin");
  }
  return t("User");
}

function deleteUser(user) {
  confirmAlert({
    title: 'Delete user',
    message: `Are you sure you want to delete user ${user.username}?`,
    buttons: [
      {
        label: 'Cancel',
      },
      {
        label: 'Delete',
        onClick: () => {
          appState.deleteUser(user)
          .then(() => {
            toast.success(`User ${user.username} deleted.`);
          })
          .catch(err => {
            toast.error(`Failed to delete user ${user.username}: ${err.message}`);
          });
        }
      }      
    ]
  });
};

class Users extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }

  getOrgName(id) {
    const { orgsByID } = this.props;
    if (orgsByID[id]) {
      return orgsByID[id].name;
    } else {
      '[Not found]'
    }
  }

  render() {
    const {
      usersByID,
      viewNewUser,
    } = this.props;

    return (
      <div>
        <div className="col-md-2" />
        <div className="col-md-8 business-table">
          <button
            className="btn btn-default"
            style={{marginBottom: '1em'}}
            onClick={ () => viewNewUser() }
          >Create User</button>
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Security Level</th>
                <th>Organization</th>
                <th>Operations</th>
              </tr>
            </thead>
            <tbody>
              {
                Object.keys(usersByID).map(key => {
                  const user = usersByID[key];
                  return (
                    <tr key={ user.username }>
                      <td>{ user.username }</td>
                      <td>{ user.email }</td>
                      <td>{ user.firstname }</td>
                      <td>{ user.lastname }</td>
                      <td>{ getSecurtyLevel(user) }</td>
                      <td>{ this.getOrgName(user.orgid) }</td>
                      <td>
                        <a
                          className="btn btn-primary btn-sm"
                          onClick={ () => appState.viewUserByID(user.username) }
                        ><i className="middle glyphicon glyphicon-pencil" /> Update
                        </a>
                        <span> </span>
                        <a
                          className="btn btn-primary btn-sm"
                          onClick={ () => deleteUser(user) }
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
    usersByID: getRelevantUsers(state),
  }),
  {
    viewNewUser,
  },
)(Users);
