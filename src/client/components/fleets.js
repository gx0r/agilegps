
import * as React from 'react';
import { connect } from 'react-redux';
import { useParams } from "react-router-dom";

import { Formik, Field } from 'formik';
import { toast } from 'react-toastify';

import * as appState from '../appState';

function Fleets(props) {
  // const { orgsByID, devicesByID } = props;

  // const { deviceId } = useParams();
  // let device;
  // if (deviceId) {
  //   device = devicesByID[deviceId];
  // } else {
  //   device = new Device();
  // }

  return (
    <div>
      <div class="col-sm-10">
        <div className="col-sm-4">
          <div className="business-table">todo</div>
        </div>
        <div className="col-sm-8 business-table">TODO</div>
      </div>
    </div>
  );
}

export default connect(
  state => ({
    devicesByID: state.devicesByID,
    orgsByID: state.orgsByID,
  })
)(Fleets);
