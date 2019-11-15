// /* Copyright (c) 2016 Grant Miner */
"use strict";
import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Navbar from './navbar';
import Map from './map';
import Sidebar from './sidebar';
import Organization from './organization';

class Root extends React.Component {
  constructor(props) {
    super(props);
    this.mapRef = React.createRef();
  }

  render() {
    return (
      <div>
        <Navbar />
        <div className="container-fluid">
          <div className="row">
            <div className="sidebar col-sm-2">
              <Sidebar />
            </div>
            <div className="col-sm-10">
              <Map />
            </div>            
          </div>
        </div>
        <div className="container-fluid">
          <div className="row">
            {/* <Reports /> */}
            <Organization />
          </div>
        </div>
      </div>
    );
  }
}

export default connect(
  state => ({
  }),
  dispatch => bindActionCreators({
  }, dispatch),
)(Root);
