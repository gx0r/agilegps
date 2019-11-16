
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import classnames from 'classnames';

import { toast } from 'react-toastify';

import appState from '../appState';

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

  static propTypes = {
  };

  componentDidMount() {
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
        });
      })
      .catch(err => {
        toast.error(err.message);
      });
  };

  logoutClick = () => {
    const wantsToLogout = window.confirm("Are you sure you wish to logout?");
    if (!wantsToLogout) {
      return;
    }

    appState
      .logOut()
      .then(() => {
        toast.success("Logged out", {
          position: toast.POSITION.BOTTOM_RIGHT,
        });
      })
      .catch(err => {
        toast.error(err.message);
      });
  };

  renderNoUser() {
    return (
      <Fragment>
        <input className="form-control"
          placeholder="Username"
          autoFocus
          onChange={ ev => this.setState({ username: ev.target.value }) }
          onKeyUp={ this.onKeyUp }
          value={ this.state.username }
        >
        </input>
        <input
          className="form-control"
          placeholder="password"
          type="password"
          onChange={ ev => this.setState({ password: ev.target.value }) }
          onKeyUp={ this.onKeyUp }
          value={ this.state.password }
        >
        </input>
        <label>
          <input
            checked={ this.rememberMe }
            type="checkbox"
            onClick={ ev => this.setState({ rememberMe: ev.target.checked })  } />
          Remember Me
        </label>
        <br />
        <button
          className="btn btn-default"
          style={{
            float: 'left'
          }}
          onClick={ this.loginClick }
          disabled={ false && this.loggingIn }
        >
          Log In
        </button>
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
            Error: { this.error }
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
