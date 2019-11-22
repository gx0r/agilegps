
import React, { Fragment } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as classnames from 'classnames';

import * as moment from 'moment';
import { toArray } from 'lodash';
import { toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';

import { translate as t } from "../i18n";
import * as appState from '../appState';
import { viewNewVehicle } from "../appStateActionCreators";

class Vehicles extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }

  render() {
    const {
      devicesByID,
      vehiclesByID,
      viewNewVehicle,
    } = this.props;

    return (
      <div>
        <div className="col-md-1" />
        <div className="col-md-10 business-table">
          <button
            className="btn btn-default"
            style={{marginBottom: '1em'}}
            onClick={ viewNewVehicle }
          >New Vehicle</button>
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              {
                Object.keys(vehiclesByID).map(key => {
                  const vehicle = vehiclesByID[key];
                  return (
                    <tr key={ vehicle.id }>
                      <td>{ vehicle.name }</td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
        </div>
        <div className="col-md-1" />
      </div>
    )
  }
}

export default connect(
  state => ({
    devicesByID: state.devicesByID,
    vehiclesByID: state.vehiclesByID,
  }),
  {
    viewNewVehicle,
  },
)(Vehicles);
