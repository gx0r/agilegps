
import React from 'react';
import { connect } from 'react-redux';
import * as classnames from 'classnames';
import { Link } from "react-router-dom";

import * as appState from '../appState';

import { toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';

import { getRelevantUsers } from '../selectors/getUsers.js';
import { viewNewUser } from "../appStateActionCreators";
import { translate as t } from "../i18n";
import { useParams } from "react-router-dom";

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

function Users(props) {
  const getOrgName = id => {
    const { orgsByID } = props;
    if (orgsByID[id]) {
      return orgsByID[id].name;
    } else {
      '[Not found]'
    }
  }

  let { orgId } = useParams();
  orgId = orgId && orgId.trim();
  console.log(orgId);

  const {
    usersByID,
    viewNewUser,
  } = props;

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
              Object.keys(usersByID)
              .map(key => {
                const user = usersByID[key];

                if (orgId && user.orgid !== orgId) {
                  return;
                }

                return (
                  <tr key={ user.username }>
                    <td>{ user.username }</td>
                    <td>{ user.email }</td>
                    <td>{ user.firstname }</td>
                    <td>{ user.lastname }</td>
                    <td>{ getSecurtyLevel(user) }</td>
                    <td>{ getOrgName(user.orgid) }</td>
                    <td>
                      <Link className="btn btn-primary btn-sm"
                        to={ `/users/edit/${user.username} `}>
                          <i className="middle glyphicon glyphicon-pencil" /> Update
                      </Link>
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

export default connect(
  state => ({
    orgsByID: state.orgsByID,
    usersByID: getRelevantUsers(state),
  }),
  {
    viewNewUser,
  },
)(Users);
