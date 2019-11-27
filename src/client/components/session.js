
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import classnames from 'classnames';

import { toast } from 'react-toastify';

import appState from '../appState';
import { confirmAlert } from 'react-confirm-alert';

class Session extends React.Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
    this.state = {
      username: '',
      password: '',
      rememberMe: false,
    }
  }

  changeUsername = username => {
    this.setState({ username: username.trim() });
  }

  onKeyUp = ev => {
    if (ev.keyCode === 13) {
      this.loginClick();
    }
  }

  loginClick = () => {
    appState
      .login({
        username: this.state.username,
        password: this.state.password,
        rememberMe: this.state.rememberMe
      })
      .then(() => {
        this.loggingIn = false;
        toast.success("Logged in", {
          position: toast.POSITION.BOTTOM_RIGHT,
          autoClose: 1500,
        });
      })
      .catch(err => {
        toast.error(err.message, {
          autoClose: 2000,
        });
      });
  };

  logoutClick = () => {
    confirmAlert({
      title: 'Logout',
      message: `Are you sure you wish to logout?`,
      buttons: [
        {
          label: 'Cancel',
        },
        {
          label: 'Ok',
          onClick: () => {
            appState
            .logOut()
            .then(() => {
              toast.success("Logged out", {
                position: toast.POSITION.BOTTOM_RIGHT,
                autoClose: 1500,
              });
            })
            .catch(err => {
              toast.error(err.message);
            });
          }
        }      
      ]
    });
  };

  renderNoDatabase() {
    <div style={{
      textAlign: 'right',
      marginTop: '2px'
    }}>  
      Unable to connect to database. Contact system administrator.    
    </div>
  }

  renderNoUser() {
    return (
      <Fragment>
        <input
          autoFocus
          className="form-control"
          onChange={ ev => this.setState({ username: ev.target.value }) }
          onKeyUp={ this.onKeyUp }
          placeholder="Username"
          value={ this.state.username }
        >
        </input>
        <input
          className="form-control"
          onChange={ ev => this.setState({ password: ev.target.value }) }
          onKeyUp={ this.onKeyUp }
          placeholder="Password"
          type="password"
          value={ this.state.password }
        >
        </input>
        <label>
          <input
            checked={ this.rememberMe }
            onClick={ ev => this.setState({ rememberMe: ev.target.checked })  }
            onKeyUp={ this.onKeyUp }
            type="checkbox"
          />
          Remember Me
        </label>
        <br />
        <div style={{
          textAlign: 'right',
          marginTop: '2px'
        }}>
          <button
            className="btn btn-default btn-success"
            disabled={ false && this.loggingIn }
            onClick={ this.loginClick }
            onKeyUp={ this.onKeyUp }
          >
            Log In
          </button>
        </div>
      </Fragment>
    );
  }

  renderUser() {
    const { user } = this.props;
    
    return (
      <div style={{
        textAlign: 'right',
        marginTop: '2px'
      }}>
        <button
          className="btn btn-default"
          style={{
            float: 'left'
          }}
          onClick={ this.logoutClick }
        >
          Log Out { user.username }
        </button>
      </div>
    );
  }

  render() {
    const { databaseConnected, user } = this.props;

    return (
      <div>
        <div
          className="row center-block"
          style={{
            width: "400px",
            marginRight: "2px",
            border: "solid thin black",
            padding: "2em"
          }}
        >
        { !databaseConnected ? this.renderNoDatabase() : (user.username ? this.renderUser() : this.renderNoUser()) }
        <br />
        </div>
        <div className="row">
          <div className="center-block" style={{
            marginTop: '2em',
            textAlign: 'center'
          }}>
            <img src="/images/logo2.png" />  
          </div>
        </div>
      </div>
    )
  }
}

export default connect(
  state => ({
    databaseConnected: state.databaseConnected,
    user: state.user,
  }),
)(Session);
