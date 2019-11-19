
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import classnames from 'classnames';

import moment from 'moment';
import { DateRangePicker, SingleDatePicker, DayPickerRangeController } from 'react-dates';

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

class Vehicle extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      calculateDistanceBetween: 'start',
      firstRowClicked: false,
      highlightStarts: false,
      highlightIgnition: false,
      reverseOrder: false,
      raw: false,
      rollup: true,
    }
  }

  static propTypes = {
  };

  clickItem = historyItem => {
    const { selectHistoryItemID } = this.props;
    selectHistoryItemID(historyItem.id);
  };

  componentWillMount() {
    const { selectDays } = this.props;
    // todo
    // selectDays(
    //   moment().subtract(1, 'day').toDate(),
    //   moment()
    //     .add(2, "day")
    //     .toDate()
    // );
  }


  recalculateHistory = () => {
    const { hist, verbose } = this.props;
    const {
      calculateDistanceBetween,
      raw,
      reverseOrder,
      rollup,
    } = this.state;
    let res = _.cloneDeep(hist);

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

    return res;
  }

  render() {
    const { 
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
      selectedOrg,
      selectedVehicle,
      setAnimationSpeed,
      setShowVerbose,
      setShowLatLong,
      showLatLong,
      startDate,
      version,
      verbose,
     } = this.props;

     const {
      calculateDistanceBetween,
      highlightStarts,
      highlightIgnition,
      reverseOrder,
      raw,
      rollup,
      selectedItemID,
     } = this.state;

     const adjustedVehicleHistory = this.recalculateHistory(hist);

     const excelHref = `/api/organizations/${selectedOrg.id}/vehiclehistory/${selectedVehicle}/?format=excel&latlong=${this.showLatLong}&rollupStationaryEvents=${rollup}&verbose=${verbose}&calculateDistanceBetween=${calculateDistanceBetween}&tzOffset=${encodeURIComponent(tzOffset())}`;

    return (
      <div className="business-table">
        <button
          className="btn btn-xs btn-primary btn-pad"
          onClick={ () => this.setState({firstRowClicked: false}) }
        >Refresh</button>
        <a href={ excelHref } style={{
          cursor: 'pointer',
          marginLeft: '1em',
        }}><img src="images/excel-icon.png" /> Excel</a>
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
          <progress value={ 0 } style={{
            marginLeft: '1em',
          }} />
          <input
            type="range"
            min="0"
            max="2000"
            // onChange={ setAnimationSpeed }
            step="1"
            value={ animationSpeed }
          />
        </div>
        <br />
        <div className="nowrap">
          <DateRangePicker
            startDate={ moment(startDate) } // momentPropTypes.momentObj or null,
            startDateId="your_unique_start_date_id" // PropTypes.string.isRequired,
            endDate={ moment(endDate) } // momentPropTypes.momentObj or null,
            endDateId="your_unique_end_date_id" // PropTypes.string.isRequired,
            onDatesChange={ ({ startDate, endDate }) => selectDays(startDate, endDate) } // PropTypes.func.isRequired,
            focusedInput={ this.state.focusedInput } // PropTypes.oneOf([START_DATE, END_DATE]) or null,
            onFocusChange={ focusedInput => this.setState({ focusedInput }) } // PropTypes.func.isRequired,
            isOutsideRange={ () => false }
          />
          <label className="padrt">
            <input
              checked={ highlightStarts }
              onClick={ () => this.setState({ highlightStarts: !highlightStarts })}
              type="checkbox"
            /> Highlight starts
          </label>
          <label className="padrt">
            <input
              checked={ highlightIgnition }
              onClick={ () => this.setState({ highlightIgnition: !highlightIgnition })}
              type="checkbox"
            /> Highlight ignition
          </label>
          <label className="padrt">
            <input
              checked={ reverseOrder }
              onClick={ ev => this.setState({ reverseOrder: ev.target.checked })}
              type="checkbox"
            /> Reverse Order
          </label>
          <label className="padrt">
            <input
              checked={ verbose }
              type="checkbox"
              onClick={ ev => setShowVerbose(ev.target.checked) }
            />
            Verbose
          </label>
          <label className="padrt">
            <input
              checked={ showLatLong }
              type="checkbox"
              onClick={ ev => setShowLatLong(ev.target.checked) }
            />
            LAT/LONG
          </label>
          <label className="padrt">
            <input
              checked={ rollup }
              type="checkbox"
              onClick={ ev => this.setState({ rollup: ev.target.checked}) }
            />
            Rollup idling & parked
          </label>
          <label className="padrt">
            <input
              checked={ raw }
              type="checkbox"
              onClick={ ev => this.setState({ raw: ev.target.checked}) }
            />
            Raw
          </label>
        </div>
        <table className="table table-bordered table-striped">
          <thead>
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
          </thead>
          <tbody>
            { adjustedVehicleHistory.length < 1 && <div>No vehicle history for this day</div> }
            { 
              adjustedVehicleHistory.map(item => {
                return (
                  <tr
                    className={ classnames('pointer', {
                      'highlight-igniton': highlightIgnition && item.cmd === "IGN" || highlightStarts && item.statusOverride === "Start"
                    }) }
                    key={ item.id }
                    onClick={ () => this.clickItem(item) }
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
    selectedOrg: state.selectedOrg,
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
