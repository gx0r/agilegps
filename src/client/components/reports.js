
import React, { Fragment, useState } from 'react';
import { connect } from 'react-redux';
import { useParams } from "react-router-dom";

import bluebird from 'bluebird';
import moment from 'moment';
import { DateRangePicker } from 'react-dates';
import { Formik, Field } from 'formik';
import { toast } from 'react-toastify';
import { merge } from 'lodash';

import * as appState from '../appState';
import * as tzOffset from "../tzoffset";
import { auth, validateResponse } from '../appState';
import * as isUserMetric from "../isUserMetric";
import tomiles from '../tomiles';

const reports = {
  mileage: null,
  idle: null,
  obd: null,
};

//create your forceUpdate hook
function useForceUpdate(){
  const [value, setValue] = useState(0); // integer state
  return () => setValue(value => ++value); // update the state to force render
}

let count = 0;

function Mileage({results, vehicles}) {
  return (
    <div>
      <table className="table-condensed table-bordered table-striped dataTable">
        <thead>
          <tr>
            <td>State</td>
            <td>{ isUserMetric() ? 'Kilometers' : 'Miles' }</td>
          </tr>
        </thead>
        <tbody>
          {
            Object.keys(vehicles).map(vid => {
              return <Fragment key={`${vid}${count++}`}>
                <tr key={`header${vid}${count++}`}>
                  <td colSpan="7" className="group">
                    { vehicles[vid].name }
                  </td>
                </tr>
                {
                  results[vid] && Object.keys(results[vid]).map(key => {
                    return <tr key={`result${vid}${key}${count++}`}>
                      <td>{key}</td>
                      <td>{tomiles(results[vid][key])}</td>
                    </tr>
                  })
                }
              </Fragment>
            })
          }
        </tbody>
      </table>
    </div>
  )
}


function Reports({ impliedSelectedVehiclesByID, orgsByID, vehiclesByID }) {
  const { orgId } = useParams();
  const [focusedInput, setFocusedInput] = useState(null);
  const [executing, setExecuting] = useState(false);
  const [executed, setExecuted] = useState(false);
  const [reportType, setReportType] = useState('mileage');
  const [results, setResults] = useState({});
  const [resultVehicles, setResultVehicles] = useState({});
  const [startDate, setStartDate] = useState(moment().subtract(1, 'day'));
  const [endDate, setEndDate] = useState(moment());
  const forceUpdate = useForceUpdate();

  const execute = () => {
    setExecuting(true);
    const ids = Object.keys(impliedSelectedVehiclesByID);

    setResultVehicles({});
    setResults({});

    let runningResults = {};
    let runningVehicles = {};

    bluebird.map(ids, id => {
        setExecuting(id);
        return fetch(`/api/organizations/${orgId}/reports/${encodeURIComponent(reportType)}?vehicles=${encodeURIComponent(JSON.stringify([id]))}&startDate=${encodeURIComponent(startDate.toISOString())}&endDate=${encodeURIComponent(
            moment(endDate).add(1, "day").toISOString())}&tzOffset=${encodeURIComponent(tzOffset())}`, auth())
        .then(validateResponse)
        .then(response => {

          runningResults = merge(runningResults, response.results);
          runningVehicles = merge(runningVehicles, response.vehicles);

          setResults(runningResults);
          setResultVehicles(runningVehicles);

          forceUpdate();
         
          // response.forEach()
          // debugger;
          // return [response.vehicles, response.results];
        })
      }
    , {concurrency:1})
    .then(response => {
      // debugger;
      // setResultVehicles(currentResultVehicles);
      // setResults(currentResults);
      toast('Report complete.', { autoClose: false, position: toast.POSITION.TOP_RIGHT })
    })
    .catch(function(err) {
      toast.error(err.message);
      setExecuting(false);
      throw err;
    })
    .finally(() => {
      // setResultsTotals(response.totals);
      setExecuting(false);
      setExecuted(true);
    });
  }

  const renderExecution = () => {
    if (!executing) {
      return 'Run!'
    }
    if (vehiclesByID[executing]) {
      const vehicle = vehiclesByID[executing];
      return `Processing vehicle ${vehicle.name}...`
    } else {
      return 'Processing...'
    }

  }

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
              onDatesChange={ ({ startDate, endDate }) => {
                setStartDate(startDate);
                setEndDate(endDate);
              } } // PropTypes.func.isRequired,
              focusedInput={ focusedInput } // PropTypes.oneOf([START_DATE, END_DATE]) or null,
              onFocusChange={ focusedInput => setFocusedInput(focusedInput) } // PropTypes.func.isRequired,
              isOutsideRange={ () => false }
            />
          </div>
          <div className="col-md-3">
            <select size={ Object.keys(reports).length } className="form-control" onChange={ key => setReportType(key) }>
            { Object.keys(reports).map(key => <option selected={ key === reportType} value={ key }>{key}</option>) }
            </select>
            <button className="btn btn-default btn-success" style={{marginTop:'1em',marginBottom: '1em'}}
              disabled={ executing } onClick={ () => execute(reportType) }
            >
              { renderExecution() }
            </button>
          </div>
      </div>
      <div className="col-sm-3" />
      <div className="row col-md-12">
        { executed && <Mileage results={results} vehicles={resultVehicles} />}
      </div>
    </div>
  );
}

export default connect(
  state => ({
    impliedSelectedVehiclesByID: state.impliedSelectedVehiclesByID,
    orgsByID: state.orgsByID,
    vehiclesByID: state.vehiclesByID,
  }),
)(Reports);
