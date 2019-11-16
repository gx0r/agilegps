
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import classnames from 'classnames';

import appState from '../appState';

class Session extends React.Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
    this.state = {
    }
  }

  static propTypes = {
  };

  componentDidMount() {
  }

  changeUsername = username => {
    this.username = username;
  }

  usernameOnKeyUp = ev => {
    if (ev.keyCode === 13) {
      this.login();
    }
  }

  loginClick = () => {
    this.loggingIn = true;
    this.error = "";

    appState
      .login({
        username: this.username.trim(),
        password: this.password,
        rememberMe: this.rememberMe
      })
      .then(() => {
        this.loggingIn = false;
      })
      .catch(err => {
        this.loggingIn = false;
        this.error = err.message;
      });
  };

  logoutClick = () => {
    const wantsToLogout = window.confirm("Are you sure you wish to logout?");
    if (!wantsToLogout) {
      return;
    }
    this.loggingIn = true;
    this.error = "";

    appState
      .logOut()
      .then(() => {
        this.loggingIn = false;
      })
      .catch(err => {
        this.loggingIn = false;
        this.error = err.message;
      });
  };

  renderNoUser() {
    return (
      <Fragment>
        <input className="form-control"
          placeholder="Username"
          autoFocus
          onChange={ ev => this.changeUsername(ev.target.value) }
          onKeyUp={ this.usernameOnKeyup }
          value={ this.username }
        >
        </input>
        <input
          className="form-control"
          placeholder="password"
          type="password"
          onChange={ ev => this.password = ev.target.value }
          value={ this.password }
        >
        </input>
        <label>
          <input
            checked={ this.rememberMe }
            type="checkbox"
            onClick={ ev => this.rememberMe = ev.target.checked } />
          Remember Me
        </label>
        <button
          className="btn btn-default"
          style={{
            float: 'left'
          }}
          onClick={ this.loginClick }
          disabled={ this.loggingIn }
        >
          Log In
        </button>
      </Fragment>
    );
  }

  renderUser() {
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
          disabled={ this.loggingIn }
        >
          Log Out
        </button>
      </div>
    );
  }

  render() {
    const { user } = this.props;

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
        { user.username ? this.renderUser() : this.renderNoUser() }
        <br />
        { this.error &&
          <div className="text-danger">
            Error: { JSON.stringify(this.error) }
          </div>
        }
        </div>
        <div className="row">
          <div className="center-block" style={{
            marginTop: '2em',
            textAlign: 'center'
          }}>
            <img src="images/logo2.png" />  
          </div>
        </div>
      </div>
    )
  }
}

export default connect(
  state => ({
    user: state.user,
  }),
  dispatch => bindActionCreators({
  }, dispatch),
)(Session);
