// /* Copyright (c) 2016 Grant Miner */
"use strict";
import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Navbar from './navbar';
import Map from './map';
import Sidebar from './sidebar';
import Organization from './organization';
import Session from './session';

import queryString from 'query-string';

class Root extends React.Component {
  constructor(props) {
    super(props);
    this.mapRef = React.createRef();
  }

  componentWillMount() {
  }

  renderView() {
    const { view } = this.props;

    if (view === 'SESSION') {
      return (
        <div className="container-fluid">
          <div className="row">
            <Session />
          </div>
        </div>
      )
    }

    return (
      <Fragment>
        <div className="container-fluid">
          <div className="row">
            <div className="sidebar col-sm-2">
              <Sidebar />
            </div>
            <div className="col-sm-10">
              {/* <Map /> */}
            </div>            
          </div>
        </div>
        <div className="container-fluid">
          <div className="row">
            {/* <Reports /> */}
            <Organization />
          </div>
        </div>
      </Fragment>
    );
  }

  render() {
    return (
      <div>
        <Navbar />
        { this.renderView() }
      </div>
    );
  }
}

export default connect(
  state => ({
    user: state.user,
    view: state.view,
  }),
  dispatch => bindActionCreators({
  }, dispatch),
)(Root);
