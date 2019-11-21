
import React, { Fragment } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as classnames from 'classnames';

import * as appState from '../appState';

import { toArray } from 'lodash';
import { toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';

import { viewNewOrganization } from "../appStateActionCreators";
import { getEventKeys } from "../selectors/getEventKeys";

class Events extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }
  
  renderEvents() { 
    const { events, keys } = this.props;

    return (
      <div>
        <div>Legend: a = azimuth, b = buffered, bp = battery percentage, d = date sent by the unit, faketow = maybe about to be towing, g = gps accuracy (1=most accurate/20=least/0=unknown or not reported), gss = gpsSignalStatus report (1 seeing, 0 not seeing), satelliteNumber = number of GPS satellites seeing, h = engine hours, ig = ignition, igd = ignition duration, m = distance (kilometers), mo = motion, p = powervcc, rid = report id, rty = report type, s = speed (kph)</div>
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
            { keys.map(key => <td>{ key }</td>) }
            </tr>
          </thead>
          <tbody>
          {
            events.map(event => {
              return (
                <tr key={ event.id }>
                  {
                    keys.map(key => {
                      if (key === 'ad') {
                        return <td><pre>...</pre></td>
                      } else {
                        return (
                          <td>{ event[key] }</td>
                        )
                      }
                    })
                  }
                </tr>
              );
            })
          }
          </tbody>
        </table>
      </div>
    )
  }

  render() {
    const { type } = this.props;

    return this.renderEvents();
  }
}

export default connect(
  state => ({
    count: state.eventCount,
    events: state.events,
    keys: getEventKeys(state),
  }),
  {},
)(Events);
