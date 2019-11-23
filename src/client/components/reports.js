
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { useParams } from "react-router-dom";

import moment from 'moment';
import { DateRangePicker } from 'react-dates';
import { Formik, Field } from 'formik';
import { toast } from 'react-toastify';

import * as appState from '../appState';

import {
  selectDays,
} from '../appStateActionCreators';

function Reports(props) {
  const { orgId } = useParams();
  const { endDate, orgsByID, selectDays, startDate, vehiclesByID } = props;

  const [focusedInput, setFocusedInput] = useState(null);

  return (
    <div className="business-table">
      <div>
        Reports TODO orgId { orgId }         
      </div>
      <div className="row">
        <div className="col-md-12" style={{ marginTop: '1em', marginBottom: '1em' }}>
          <span>Quick select </span>
          <span className="button-group">
              <button className="btn btn-default">Today</button>
              <button className="btn btn-default">Yesterday</button>
              <button className="btn btn-default">Last 2 Days</button>
              <button className="btn btn-default">Last 3 Days</button>
              <button className="btn btn-default">Last week</button>
              <button className="btn btn-default">Last month</button>
            </span>
          </div>
          <div className="col-md-12" style={{ marginTop: '1em', marginBottom: '1em' }}>
            <DateRangePicker
              startDate={ moment(startDate) } // momentPropTypes.momentObj or null,
              startDateId="reports_start_date_id" // PropTypes.string.isRequired,
              endDate={ moment(endDate) } // momentPropTypes.momentObj or null,
              endDateId="reports_end_date_id" // PropTypes.string.isRequired,
              onDatesChange={ ({ startDate, endDate }) => selectDays(startDate, endDate) } // PropTypes.func.isRequired,
              focusedInput={ focusedInput } // PropTypes.oneOf([START_DATE, END_DATE]) or null,
              onFocusChange={ focusedInput => setFocusedInput(focusedInput) } // PropTypes.func.isRequired,
              isOutsideRange={ () => false }
            />
          </div>
          <div className="col-md-3">
          </div>
      </div>
      <div className="col-sm-3" />
    </div>
  );
}

export default connect(
  state => ({
    orgsByID: state.orgsByID,
    vehiclesByID: state.vehiclesByID,
  }),
  {
    selectDays,
  }
)(Reports);
