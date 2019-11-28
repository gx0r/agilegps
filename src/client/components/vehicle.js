
import React, {useState, useEffect} from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import classnames from 'classnames';
import { useParams } from "react-router-dom";

import moment from 'moment';
import { DateRangePicker } from 'react-dates';

import helpers from '../../common/helpers';
import { city, street } from "../../common/addressdisplay";
import { state as stateFormat } from "../../common/addressdisplay";
import milesfield from "../../common/milesfield.js";
import formatDate from "../formatDate";
import hidenan from "../../common/hidenan";
import tomiles from "../tomiles";
import todir from "../../common/todir";
import isUserMetric from "../isUserMetric";
import Status from "../../common/status.js";
import tzOffset from "../tzoffset";

import { auth, validateResponse, updateSelectedVehicleHistory } from '../appState';

import {
  animationPlay,
  animationPause,
  animationStop,
  selectDays,
  selectHistoryItemID,
  setShowVerbose,
  setShowLatLong,
  setAnimationSpeed,
} from '../appStateActionCreators';

function Vehicle({ 
  animationPlay,
  animationPause,
  animationStop,
  animationSpeed,
  advancedUI,
  autoUpdate,
  endDate,
  hist,
  selectDays,
  selectedHistoryItemID,
  selectedMapVehicleID,
  selectedVehicle,
  setAnimationSpeed,
  setShowVerbose,
  setShowLatLong,
  showLatLong,
  startDate,
  version,
  verbose,
  }){
  const [calculateDistanceBetween, setCalculateDistanceBetween] = useState('start');
  const [firstRowClicked, setFirstRowClicked] = useState(false);
  const [highlightStarts, setHighlightStarts] = useState(false);
  const [highlightIgnition, setHighlightIgnition] = useState(false);
  const [reverseOrder, setReverseOrder] = useState(false);
  const [raw, setRaw] = useState(false);
  const [rollup, setRollup] = useState(true);
  const [focusedInput, setFocusedInput] = useState(null);
  
  const [localHistory, setLocalHistory] = useState([]);
  const { orgId } = useParams();


  const clickItem = historyItem => {
    selectHistoryItemID(historyItem.id);
  };

  useEffect(() => {
    if (!startDate || !endDate) {
      return;
    }

    const url =
      "/api/organizations/" +
      selectedVehicle.orgid +
      "/vehiclehistory/" +
      selectedVehicle.id +
      "?startDate=" +
      encodeURIComponent(startDate.toISOString(true)) +
      "&endDate=" +
      encodeURIComponent(endDate.toISOString(true));

    NProgress.start();
    fetch(url, auth())
      .then(validateResponse)
      .then(res => {
        if (raw) {
          if (rollup) {
            res = helpers.rollup(res);
          }
          if (!reverseOrder) {
            res.reverse();
          }
        } else {
          if (!verbose) {
            res = res.filter(helpers.isNotVerbose);
          }

          res = helpers.cleanData(res);
          res = helpers.mileageChange(res);

          if (rollup) {
            res = helpers.rollup(res);
          }
          res = helpers.addStartStop(res);

          if (calculateDistanceBetween === 'start') {
            res = helpers.startStopMileage(res);
          } else {
            res = helpers.ignitionMileage(res);
          }

          if (!reverseOrder) {
            res.reverse();
          }
        }
        setLocalHistory(res);

      })
      .finally(NProgress.done);
  }, [calculateDistanceBetween, startDate, endDate, reverseOrder, rollup, verbose, raw]);

  const mySelectDays = (startDate, endDate) => {
    selectDays(startDate, endDate);
    // updateSelectedVehicleHistory();
  }

  const excelHref = `/api/organizations/${orgId}/vehiclehistory/${selectedVehicle}/?format=excel&latlong=${showLatLong}&rollupStationaryEvents=${rollup}&verbose=${verbose}&calculateDistanceBetween=${calculateDistanceBetween}&tzOffset=${encodeURIComponent(tzOffset())}`;

  return (
    <div className="business-table">
      <button
        className="btn btn-xs btn-primary btn-pad"
        onClick={ () => setFirstRowClicked(false) }
      >Refresh</button>
      <a href={ excelHref } style={{
        cursor: 'pointer',
        marginLeft: '1em',
      }}><img src="/images/excel-icon.png" /> Excel</a>
      <div style={{
        backgroundColor: 'rgb(221, 221, 221)'
      }}>
        <button
          className="btn btn-xs btn-success glyphicon glyphicon-play"
          onClick={ animationPlay }
        />
        <button
          className="btn btn-xs btn-success glyphicon glyphicon-pause"
          onClick={ animationPause }
        />
        <button
          className="btn btn-xs btn-success glyphicon glyphicon-stop"
          onClick={ animationStop }
        />
        <progress
          value={ 0 }
          style={{
            marginLeft: '1em',
          }}
        />
        <input
          type="range"
          min="0"
          max="2000"
          onChange={ () => window.alert('todo') }
          step="1"
          value={ animationSpeed }
        />
      </div>
      <br />
      <div className="nowrap">
        <DateRangePicker
          startDate={ moment(startDate) } // momentPropTypes.momentObj or null,
          startDateId="verhicles_start_date_id" // PropTypes.string.isRequired,
          endDate={ moment(endDate) } // momentPropTypes.momentObj or null,
          endDateId="vehicles_end_date_id" // PropTypes.string.isRequired,
          onDatesChange={ ({ startDate, endDate }) => mySelectDays(startDate, endDate) } // PropTypes.func.isRequired,
          focusedInput={ focusedInput } // PropTypes.oneOf([START_DATE, END_DATE]) or null,
          onFocusChange={ focusedInput => setFocusedInput(focusedInput) } // PropTypes.func.isRequired,
          isOutsideRange={ () => false }
        />
        <label className="padrt">
          <input
            checked={ highlightStarts }
            onChange={ev => setHighlightStarts(ev.target.checked)}
            type="checkbox"
          /> Highlight starts
        </label>
        <label className="padrt">
          <input
            checked={ highlightIgnition }
            onChange={ev => setHighlightIgnition(ev.target.checked)}
            type="checkbox"
          /> Highlight ignition
        </label>
        <label className="padrt">
          <input
            checked={ reverseOrder }
            onChange={ev => setReverseOrder(ev.target.checked)}
            type="checkbox"
          /> Reverse Order
        </label>
        <label className="padrt">
          <input
            checked={ verbose }
            type="checkbox"
            onChange={ev => setShowVerbose(ev.target.checked) }
          />
          Verbose
        </label>
        <label className="padrt">
          <input
            checked={ showLatLong }
            type="checkbox"
            onChange={ ev => setShowLatLong(ev.target.checked) }
          />
          LAT/LONG
        </label>
        <label className="padrt">
          <input
            checked={ rollup }
            type="checkbox"
            onChange={ev => setRollup(ev.target.checked)}
          />
          Rollup idling & parked
        </label>
        <label className="padrt">
          <input
            checked={ raw }
            type="checkbox"
            onChange={ev => setRaw(ev.target.checked)}
          />
          Raw
        </label>
      </div>
      <table className="table table-bordered table-striped">
        <thead>
          <tr>
            <td>Date</td>
            <td>Address</td>
            <td>City</td>
            <td>State</td>
            <td>{ isUserMetric() ? 'Kilometers' : 'Miles' }</td>
            { verbose && <td>Odometer</td> }
            { verbose && <td>Engine Hours</td> }
            <td>Dir</td>
            <td>{ isUserMetric() ? 'km/h' : 'mph' }</td>
            { showLatLong && <td>Lat</td> }
            { showLatLong && <td>Long</td> }
            <td>Status</td>
            { verbose && <td>Online</td> }
            { verbose && <td>Battery %</td> }
            <td>GPS</td>
            { raw && <td>Raw</td> }
          </tr>
        </thead>
        <tbody>
          { localHistory.length < 1 && <tr><td>No vehicle history for this day</td></tr> }
          { 
            localHistory.map(item => {
              return (
                <tr
                  className={ classnames('pointer', {
                    'highlight-igniton': highlightIgnition && item.cmd === "IGN" || highlightStarts && item.statusOverride === "Start"
                  }) }
                  key={ item.id }
                  onClick={ () => clickItem(item) }
                  style={{
                    backgroundColor: item.id === selectedHistoryItemID ? '#FEE0C6' : ''
                  }}
                >
                  <td>{ formatDate(item.d) }</td>
                  <td>{ street(item) }</td>
                  <td>{ city(item) }</td>
                  <td>{ stateFormat(item) }</td>
                  <td style={{
                    color: item.idleTime != null && Status.getStatusColor(item)
                  }}>
                    { milesfield(item, isUserMetric()) }
                  </td>
                  { verbose && <td>{ hidenan(tomiles(item.m)) }</td> }
                  { verbose && <td>{ item.h }</td> }
                  <td>{ todir(item) }</td>
                  <td>{ hidenan(tomiles(item.m)) }</td>
                  { showLatLong && <td>{ item.la }</td> }
                  { showLatLong && <td>{ item.lo }</td> }
                  <td style={{
                    color: Status.getStatusColor(item)
                  }}>
                  { raw && item.cmd } { Status.getStatus(item) }
                  </td>
                  { verbose && <td>{ item.b ? 'Buffered' : 'Yes' }</td>}
                  { verbose && <td>{ item.bp }</td>}
                  <td><img src={ helpers.getAccuracyAsImg(item.g) } /></td>
                  { raw && <td>
                      <pre>
                        { JSON.stringify(item, null, 4) }
                      </pre>
                    </td>
                  }
                </tr>
              );
            })
          }
        </tbody>
      </table>
    </div>
  );
}

export default connect(
  state => ({
    advancedUI: state.user.advancedUI,
    animationSpeed: state.animationSpeed,
    autoUpdate: state.autoUpdate,
    endDate: state.endDate,
    hist: state.selectedVehicleHistory,
    impliedSelectedVehiclesByID: state.impliedSelectedVehiclesByID,
    selectedHistoryItemID: state.selectedHistoryItemID,
    selectedVehicle: state.selectedVehicle,
    startDate: state.startDate,
    showLatLong: state.showLatLong,
    user: state.user,
    verbose: state.verbose,
  }),
  dispatch => bindActionCreators({
    animationPlay,
    animationPause,
    animationStop,
    selectHistoryItemID,
    selectDays,
    setShowVerbose,
    setShowLatLong,
    setAnimationSpeed,
  }, dispatch),
)(Vehicle);
