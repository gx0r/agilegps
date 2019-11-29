
import React, { Fragment, useState } from 'react';
import { connect } from 'react-redux';  
import { useParams } from "react-router-dom";

import bluebird from 'bluebird';
import moment from 'moment';
import { DateRangePicker } from 'react-dates';
import { Formik, Field } from 'formik';
import { toast } from 'react-toastify';
import { get, isFinite, merge } from 'lodash';

import * as tzOffset from "../tzoffset";
import { auth, validateResponse } from '../appState';
import * as isUserMetric from "../isUserMetric";
import tomiles from '../tomiles';
import tohms from './tohms';
import * as formatDate from '../formatDate';
import * as todir from '../../common/todir'; 
import { full } from "../../common/addressdisplay";

const reports = [
  'idle',
  'daily',
  'mileage',
  'odometer',
  'speed',
  'ignition',
  'start',
  'summary',
  'obd',
  'jes',
]

function getReportName(report) {
  switch (report) {
    case 'idle':
      return 'Idle Report';
    case 'daily':
      return 'Begin Day End Day Report';
    case 'mileage':
      return 'Mileage by State Summary Report';
    case 'odometer':
      return 'Odometer by State Summary Report';
    case 'speed':
      return 'Speed Report';
    case 'ignition':
      return 'Ignition Detail Report';
    case 'start':
      return 'Start/Stop Detail Report';
    case 'summary':
      return 'Vehicle Summary Report';
    case 'obd':
      return 'OBD-II Status Report';
    case 'jes':
      return 'OBD-II Engine Report';
  }
}


function renderLocation(item) {
  let res = "";
  if (street(item) !== "") {
    res = res + street(item);
  }
  if (city(item) !== "") {
    res = res + ", " + city(item);
  }
  if (state(item) !== "") {
    res = res + ", " + state(item);
  }
  return res;
}

//create your forceUpdate hook
function useForceUpdate(){
  const [value, setValue] = useState(0); // integer state
  return () => setValue(value => ++value); // update the state to force render
}

let count = 0;

function Idle({results, vehicles, totals = []}) {
  return (
    <div>
      <div>
        <table className="table table-condensed table-bordered table-striped dataTable">
          <thead>
            <tr>
              <td>Vehicle</td>
              <td>Idling Total</td>
            </tr>
          </thead>
          <tbody>
            { Object.keys(vehicles).map(vid => { <tr>
              <td>{ vehicles[vid].name }</td>
              <td>{ totals[vid] && tohms(totals[vid] / 1000) }</td>
            </tr>
            })}
          </tbody>
        </table>
      </div>
      <table className="table-condensed table-bordered table-striped dataTable">
        <thead>
          <tr>
            <td>Location</td>
            <td>City</td>
            <td>State</td>
            <td>Idle Start</td>
            <td>Idle End</td>
            <td>Duration</td>
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

function Daily({results, vehicles}) {
  return (
    <div>
      <table className="table-condensed table-bordered table-striped dataTable">
        <thead>
          <tr>
            <td>Date</td>
            <td>First Ign On</td>
            <td>Last Ign Off</td>
            <td>Duration</td>
            <td>Begin Odometer</td>
            <td>End Odometer</td>
            <td>{ isUserMetric() ? 'Kilometers' : 'Miles' }</td>
          </tr>
        </thead>
        <tbody>
          { Object.keys(vehicles).map(vid => <tr key={count++}>
            <td colSpan="7" className="group">{ vehicles[vid].name }</td>
            { results[vid].map( result => <tr>
              <td>{ formatDate(result.d) }</td>
              <td>{ result.firstIgnOn && formatDate(result.firstIgnOn) }</td>
              <td>{ result.lastIgnOff && formatDate(result.lastIgnOff) }</td>
              <td>{ tohms(result.duration) }</td>
              <td>{ tomiles(result.beginOdometer) }</td>
              <td>{ tomiles(result.endOdometer) }</td>
              <td>{ tomiles(result.distance) }</td>
            </tr>)}
          </tr> )}
        </tbody>
      </table>
    </div>

  );
}

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

function Odometer({results, vehicles}) {
  let key = 0;
  return (
    <div>
      <table className="table-condensed table-bordered table-striped dataTable">
        <thead>
          <tr>
            <td>State</td>
            <td>{ isUserMetric() ? 'Kilometers' : 'Miles' }</td>
            <td>Start Odometer</td>
            <td>End Odometer</td>
          </tr>
        </thead>
        <tbody>
          {
            Object.keys(vehicles).map(vid => {
              return <Fragment key={`${vid}${key++}`}>
                <tr key={`header${vid}${key++}`}>
                  <td colSpan="7" className="group">
                    { vehicles[vid].name }
                  </td>
                </tr>
                {
                  results[vid].map(item => {
                    return <tr key={`${key++}`}>
                      <td>{item.state}</td>
                      <td>{tomiles(item.odometerEnd - item.odometerStart)}</td>
                      <td>{tomiles(item.odometerStart)}</td>
                      <td>{tomiles(item.odometerEnd)}</td>
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

function Speed({results, vehicles, totals = {}}) {
  let key = 0;
  return (
    <div>
      <table className="table-condensed table-bordered table-striped dataTable">
        <thead>
          <tr>
            <td>Vehicle</td>
            <td>Highest { isUserMetric() ? "km/h" : "mph" }</td>
          </tr>
        </thead>
        <tbody>
          {
            Object.keys(vehicles).map(vid => {
              if (isFinite(tomiles(totals[vid]))) {
                return (
                  <tr key={key++}>
                    <td>{ vehicles[vid].name }</td>
                    <td>{ tomiles(totals[vid]) }</td>
                  </tr>
                );
              }
            })
          }
        </tbody>
      </table>
      <br />
      <table className="table-condensed table-bordered table-striped dataTable">
        <thead>
          <tr>
            <td>Location</td>
            <td>Date</td>
            <td>Heading</td>
          </tr>
        </thead>
        <tbody>
          {
            Object.keys(vehicles).map(vid =>
            <tr key={vid}>
              <td colSpan="7" className="group">{ vehicles[vid] && vehicles[vid].name }</td>
              {
                results[vid].map(item =>
                  <tr key={key++}>
                    <td>{ renderLocation(item) }</td>
                    <td>{ formatDate(item.d) }</td>
                    <td>{ todir(item) }</td>
                    <td>{ tomiles(item.s) }</td>
                </tr>
                )
              }
            </tr>)
          }
        </tbody>
      </table>
    </div>
  )
}

function Ignition({results, vehicles}) {
  let key = 0;
  return (
    <div>
      <table className="table-condensed table-bordered table-striped dataTable">
        <thead>
          <tr>
            <td>Ign On</td>
            <td>Ign Off</td>
            <td>Ignition On Time</td>
            <td>{ isUserMetric() ? 'Kilometers' : 'Miles' }</td>
            <td>Parked @</td>
            <td>Parked Until</td>
            <td>Parked Time</td>
            <td>Idle Time</td>
          </tr>
        </thead>
        <tbody>
          {
            Object.keys(vehicles).map(vid =>
            <tr key={ key++ }>
              <td colSpan="8" className="group">{ vehicles[vid] && vehicles[vid].name }</td>
              {
                results[vid].map(item =>
                  <tr key={ key++ }>
                    <td>{ item.startTime && formatDate(item.startTime) }</td>
                    <td>{ formatDate(item.d) }</td>
                    <td>{ item.transitTime && tohms(item.transitTime)  }</td>
                    <td>{ tomiles(item.startStopMileage) }</td>
                    <td>{ full(item) }</td>
                    <td>{ item.parkedEnd && formatDate(item.parkedEnd) }</td>
                    <td>{ item.parkedDuration && tohms(item.parkedDuration) }</td>
                    <td>{ item.idleDuration && tohms(item.idleDuration) }</td>
                </tr>
                )
              }
            </tr>)
          }
        </tbody>
      </table>
    </div>
  )
}

function Start({results, vehicles}) {
  let key = 0;
  return (
    <div>
      <table className="table-condensed table-bordered table-striped dataTable">
        <thead>
          <tr>
            <td>Started Moving</td>
            <td>Stopped Moving</td>
            <td>Transit Time</td>
            <td>{ isUserMetric() ? 'Kilometers' : 'Miles' }</td>
            <td>Parked @</td>
            <td>Parked Until</td>
            <td>Parked Time</td>
            <td>Idle Time</td>
          </tr>
        </thead>
        <tbody>
          {
            Object.keys(vehicles).map(vid =>
            <tr key={ key++ }>
              <td colSpan="8" className="group">{ vehicles[vid] && vehicles[vid].name }</td>
              {
                results[vid].map(item =>
                  <tr key={ key++ }>
                    <td>{ item.startTime && formatDate(item.startTime) }</td>
                    <td>{ formatDate(item.d) }</td>
                    <td>{ item.transitTime && tohms(item.transitTime)  }</td>
                    <td>{ tomiles(item.startStopMileage) }</td>
                    <td>{ full(item) }</td>
                    <td>{ item.parkedEnd && formatDate(item.parkedEnd) }</td>
                    <td>{ item.parkedDuration && tohms(item.parkedDuration) }</td>
                    <td>{ item.idleDuration && tohms(item.idleDuration) }</td>
                </tr>
                )
              }
            </tr>)
          }
        </tbody>
      </table>
    </div>
  )
}

function Summary({results, vehicles}) {
  let key = 0;
  return (
    <div>
      <table className="table-condensed table-bordered table-striped dataTable">
        <thead>
          <tr>
            <td>Vehicle</td>
            <td>Transit Time</td>
            <td>{ isUserMetric() ? 'Kilometers' : 'Miles' }</td>
            <td>Parked Time</td>
            <td>Parked</td>
            <td>Avg Park</td>
            <td>Total Idling</td>
            <td>Idle</td>
            <td>Avg Idle Time</td>
            <td>Begin Odometer</td>
            <td>End Odometer</td>
          </tr>
        </thead>
        <tbody>
          {
            Object.keys(vehicles).map(vid => <tr key={ key++ }>
              <td>{ vehicles[vid].name }</td>
              <td>{ tohms(results[vid].totalTransit) }</td>
              <td>{ tomiles(results[vid].distance) }</td>
              <td>{ tohms(results[vid].totalPark) }</td>
              <td>{ results[vid].parks }</td>
              <td>{ tohms(results[vid].avgPark) }</td>
              <td>{ tohms(results[vid].totalIdle) }</td>
              <td>{ results[vid].idles }</td>
              <td>{ results[vid].avgIdle }</td>
              <td>{ tomiles(results[vid].beginOdometer) }</td>
              <td>{ tomiles(results[vid].endOdometer) }</td>
            </tr>)
          }
        </tbody>
      </table>
    </div>
  )
}

function Obd({results, vehicles}) {
  let key = 0;
  return (
    <div>
      <table className="table-condensed table-bordered table-striped dataTable">
        <thead>
          <tr>
            <td>Date</td>
            <td>Location</td>
            <td>City</td>
            <td>State</td>
            <td>Conn</td>
            <td>⚠</td>
            <td>Codes</td>
            <td>Temp</td>
            <td>Fuel</td>
            <td>Load</td>
            <td>ThrtlPos</td>
            <td>RPMs</td>
            <td>Fuel Cnsmp</td>
            <td>PIDs</td>
            <td>Speed</td>
            <td>Power</td>
            <td>VIN</td>
            <td>{ isUserMetric() ? 'OBD Kilometers' : 'OBD Mileage' }</td>
            <td>{ isUserMetric() ? 'Kilometers' : 'Miles' }</td>
          </tr>
        </thead>
        <tbody>
          {
            Object.keys(vehicles).map(vid =>
            <tr key={ key++ }>
              <td colSpan="19" className="group">{ vehicles[vid].name }</td>
              {
                results[vid].map(result => {
                  if (!result.obd) {
                    result.obd = {};
                  }
                  if (!result.obd.diagnosticTroubleCodes) {
                    result.obd.diagnosticTroubleCodes = [];
                  }
                  return <tr key={ key++ }>
                      <td>{ formatDate(result.d) }</td>
                    <td>{ street(result) }</td>
                    <td>{ city(result) }</td>
                    <td>{ state(result) }</td>
                    <td>{ result.obd.connect && "✓" }</td>
                    <td>{ result.obd.malfunction && result.obd.diagnosticTroubleCodes.length + "⚠" }</td>
                    <td>{ result.obd.diagnosticTroubleCodes.map(code => <a href={ `http://www.obd-codes.com/p${code}` } target="_new">{ code }</a>) }</td>
                    <td>{ result.obd.temp && result.obd.temp }</td>
                    <td>{ result.obd.fuelLevelInput && result.obd.fuelLevelInput + "%" }</td>
                    <td>{ result.obd.engineLoad }</td>
                    <td>{ result.obd.throttlePosition }</td>
                    <td>{ result.obd.RPMs }</td>
                    <td>{ result.obd.fuelConsumption }</td>
                    <td>{ result.obd.supportPIDs }</td>
                    <td>{ toMiles(result.obd.speed) }</td>
                    <td>{ result.obd.powermv && result.obd.powermV / 1000 + "V" }</td>
                    <td>{ result.obd.vin }</td>
                    <td>{ toMiles(result.obd.mileage) }</td>
                    <td>{ toMiles(result.m) }</td>
                </tr>
                })
              }
            </tr>)
          }
        </tbody>
      </table>
    </div>
  )
}

function Jes({results, vehicles}) {
  let key = 0;
  return (
    <div>
      <table className="table-condensed table-bordered table-striped dataTable">
        <thead>
          <tr>
            <td>Date</td>
            <td>Location</td>
            <td>City</td>
            <td>State</td>
            <td>RPM Max</td>
            <td>RPM avg</td>
            <td>Throttle max</td>
            <td>Throttle avg</td>
            <td>Engine Load max</td>
            <td>Engine Load avg</td>
          </tr>
        </thead>
        <tbody>
          {
            Object.keys(vehicles).map(vid =>
            <tr key={ key++ }>
              <td colSpan="18" className="group">{ vehicles[vid].name }</td>
              {
                results[vid].map(result => {
                  if (!result.obd) {
                    result.obd = {};
                  }
                  if (!result.obd.diagnosticTroubleCodes) {
                    result.obd.diagnosticTroubleCodes = [];
                  }
                  return <tr key={ key++ }>
                    <td>{ formatDate(result.d) }</td>
                    <td>{ street(result) }</td>
                    <td>{ city(result) }</td>
                    <td>{ state(result) }</td>
                    <td>{ get(result, 'jes.maxRPM') }</td>
                    <td>{ get(result, 'jes.averageRPM') }</td>
                    <td>{ get(result, 'jes.maxThrottlePosition') }</td>
                    <td>{ get(result, 'jes.averageThrottlePosition') }</td>
                    <td>{ get(result, 'jes.maxEngineLoad') }</td>
                    <td>{ get(result, 'jes.averageEngineLoad') }</td>
                </tr>
                })
              }
            </tr>)
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
  const [reportType, setReportType] = useState('idle');
  const [results, setResults] = useState({});
  const [resultVehicles, setResultVehicles] = useState({});
  const [startDate, setStartDate] = useState(moment().subtract(1, 'day'));
  const [endDate, setEndDate] = useState(moment());
  const forceUpdate = useForceUpdate();


  const dateRangeChange = ev => {
    if (ev === "Today") {
      setStartDate(
        moment()
          .startOf("day")
          .add(1, "days")
      );
      setEndDate(
        moment()
          .startOf("day")
          .add(1, "days")
      );
    }
    if (ev === "Yesterday") {
      setStartDate(
        moment()
          .startOf("day")
      );
      setEndDate(
        moment()
          .startOf("day")
          .add(0, "days")
      );
    }
    if (ev === "Last 2 Days") {
      setStartDate(
        moment()
          .startOf("day")
          .subtract(0, "days")
      );
      setEndDate(
        moment()
          .startOf("day")
          .add(1, "days")
      );
    }
    if (ev === "Last 3 Days") {
      setStartDate(
        moment()
          .startOf("day")
          .subtract(1, "days")
      );
      setEndDate(
        moment()
          .startOf("day")
          .add(1, "days")
      );
    }
    if (ev === "This week to date") {
      setStartDate(
        moment()
          .startOf("day")
          .subtract(7, "days")
      );
      setEndDate(
        moment()
          .startOf("day")
          .add(1, "days")
      );
    }
    if (ev === "Last week") {
      setStartDate(
        moment()
          .startOf("day")
          .subtract(1, "week")
      );
      setEndDate(
        moment()
          .startOf("day")
      );
    }
    if (ev === "This month") {
      setStartDate(
        moment()
          .startOf("month")
          .add(1, "days")
      );
      setEndDate(
        moment()
          .startOf("month")
          .add(1, "month")
          .add(0, "days")
      );
    }
    if (ev === "Last month") {
      setStartDate(
        moment()
          .startOf("month")
          .subtract(1, "month")
          .add(1, "days")
      );
      setEndDate(
        moment()
          .startOf("month")
          .add(0, "days")
      );
    }
  };

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
            moment(endDate).toISOString())}&tzOffset=${encodeURIComponent(tzOffset())}`, auth())
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

  const renderResults = () => {
    if (!executed) {
      return null;
    }
    switch (reportType) {
      case 'idle':
        return <Idle results={results} vehicles={resultVehicles} />
      case 'mileage':
        return <Mileage results={results} vehicles={resultVehicles} />
      case 'daily':
        return <Daily results={results} vehicles={resultVehicles} />
      case 'odometer':
        return <Odometer results={results} vehicles={resultVehicles} />
      case 'speed':
        return <Speed results={results} vehicles={resultVehicles} />
      case 'ignition':
        return <Ignition results={results} vehicles={resultVehicles} />
      case 'start':
        return <Start results={results} vehicles={resultVehicles} />
      case 'summary':
        return <Summary results={results} vehicles={resultVehicles} />
      case 'obd':
        return <Obd results={results} vehicles={resultVehicles} />
      case 'jes':
        return <Jes results={results} vehicles={resultVehicles} />   
      }
  }

  return (
    <div className="business-table">
      <div className="row">
        <div className="col-md-12" style={{ marginTop: '1em', marginBottom: '1em' }}>
          <span>Quick select </span>
          <span className="button-group">
              <button className="btn btn-default" onClick={ () => dateRangeChange("Today") }>Today</button>
              <button className="btn btn-default" onClick={ () => dateRangeChange("Yesterday") }>Yesterday</button>
              <button className="btn btn-default" onClick={ () => dateRangeChange("Last 2 Days") }>Last 2 Days</button>
              <button className="btn btn-default" onClick={ () => dateRangeChange("Last 3 Days") }>Last 3 Days</button>
              <button className="btn btn-default" onClick={ () => dateRangeChange("Last week") }>Last week</button>
              <button className="btn btn-default" onClick={ () => dateRangeChange("Last month") }>Last month</button>
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
            <select size={ reports.length } className="form-control" onChange={ ev => {
              setResults({});
              setResultVehicles({});
              setReportType(ev.target.value);
            } }>
            { reports.map(key => <option selected={ key === reportType} value={ key }>{getReportName(key)}</option>) }
            </select>
            <button className="btn btn-default btn-success" style={{marginTop:'1em',marginBottom: '1em'}}
              disabled={ executing } onClick={ () => execute(reportType) }
            >
              { renderExecution() }
            </button>
          </div>
          <div className="row col-md-12">
            { renderResults() }
          </div>
      </div>
      <div className="col-sm-3" />
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
