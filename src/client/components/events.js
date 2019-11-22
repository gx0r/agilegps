
import React, { Fragment } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as classnames from 'classnames';

import { union } from 'lodash';
import { auth, validateResponse, } from "../appState.js";
import * as formatDate from "../formatDate";
import eventreportparser from '../../helper/eventreportparser';
import { confirmAlert } from 'react-confirm-alert';

class Events extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0,
      events: [],
      loading: false,
      page: 1,
      pageSize: 300,
      parseDates: true,
      search: '',
    }
  }

  getEventKeys() {
    const { events } = this.state;
    if (events.length > 0) {
      // const events = take(events, 10);
      let keys = [];
      events.forEach(event => {
        keys = union(keys, Object.keys(event));
      });

      // Add buttons
      // keys.unshift("Geocode");
      return keys;
    } else {
      return [];
    }
  }

  componentDidMount() {
    this.updateEvents();
  }

  componentDidUpdate(prevProps) {
    if (this.props.type !== prevProps.type) {
      this.updateEvents();
    }
  }

  updateEvents = () => {
    NProgress.start();
    const { type } = this.props;
    const {
      count,
      loading,
      page,
      pageSize,
      search,
    } = this.state;

    this.setState( {
      loading: true,
      events: [],
      count: 0,
    } );

    return fetch(
        "/api/count/" +
          type +
          (type === "rawevents"
            ? "?search=" + encodeURIComponent(search)
            : ""),
        auth()
      )
      .then(response => {
        NProgress.inc();
        return validateResponse(response);
      })
      .then(result => {
        NProgress.inc();
        this.setState( {count: result.count} );
      })
      .then(() => {
        const url =
          "/api/" +
          type +
          "/?page=" +
          page +
          "&pageSize=" +
          pageSize +
          "&search=" +
          encodeURIComponent(search);
        return fetch(url, auth());
      })
      .then(response => {
        NProgress.inc();
        return validateResponse(response);
      })
      .then(events => this.setState( { events } ))
      .finally(()=> {
        NProgress.done();
        this.setState( { loading: false });
        // this.forceUpdate();
      });
  }

  renderPagination() {
    const { count, pageSize } = this.state;
    const pages = Math.ceil(count / pageSize);
    const elements = [];
    for (let i = 1; i < pages + 1; i++) {
      elements.push(
        <li key={ i }
        >
          <a
            className="pointer"
            onClick={ ev => {
              this.setState({ page: i });
              this.updateEvents();
            } }
          >{ i }</a>
        </li>
      );
    }
    elements.push(<li key={ 'nextPage' }>
      <a className="pointer" onClick={ this.nextPage }>»</a>
    </li>)

    return <ul className="pagination">{ elements }</ul>;
  }
  
  render() { 
    const { type } = this.props;
    const { count, events, loading, page, pageSize, parseDates, search } = this.state;
    const keys = this.getEventKeys();
    const pages = Math.ceil(count / pageSize);

    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col">
            <label className="control-label col-sm-1">
              Selected Page 
              <input
                className="form-control"
                onChange={ ev => this.setState( { page: parseInt(ev.target.value, 10) }) }
                type="number"
                min={ 1 }
                max={ pages }
                value={ page }
              />
            </label>
            <label className="control-label col-sm-1">
            Count per Page
              <input
                className="form-control"
                onChange={ ev => this.setState( { events: [], count: 0, pageSize: parseInt(ev.target.value, 10) }) }
                type="number"
                value={ pageSize }
              />
            </label>
            { type === 'rawevents' && <label className="control-label col-sm-2">
              Search by IMEI
              <input
                className="form-control"
                onChange={ ev => this.setState({ search: ev.target.value }) }
                value={ search }
              />
            </label> }
            <label className="control-label col-sm-2">
              Parse Dates to Local
              <input
                className="form-control"
                checked={ parseDates }
                onChange={ ev => this.setState( { parseDates: ev.target.checked }) }
                type="checkbox"
              />
            </label>
            <label className="control-label">
              <button
                className="btn btn-default btn-success"
                disabled={ loading }
                onClick={ this.updateEvents }
                style={{
                  marginRight: '1em',
                }}
              >Refresh</button>
            </label>
            { this.renderPagination() }
          </div>
        </div>
        <div className="row">
          { type === 'events' && <div>Legend: a = azimuth, b = buffered, bp = battery percentage, d = date sent by the unit, faketow = maybe about to be towing, g = gps accuracy (1=most accurate/20=least/0=unknown or not reported), gss = gpsSignalStatus report (1 seeing, 0 not seeing), satelliteNumber = number of GPS satellites seeing, h = engine hours, ig = ignition, igd = ignition duration, m = distance (kilometers), mo = motion, p = powervcc, rid = report id, rty = report type, s = speed (kph)</div> }
          { `${count} ${type}` }
          <table className="table table-bordered table-striped business-table">
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
                        if (type === 'rawevents' && key === 'message') {
                          const rawMessage = event[key];
                          return <td><button onClick={ () => {
                            const parsed = eventreportparser(rawMessage);
                            delete parsed.args;
                            confirmAlert({
                              title: 'Parsed',
                              buttons: [
                                { label: 'Close' }
                              ],
                              message: <pre>{ JSON.stringify(parsed, null, 4) }</pre>,
                            });
                          }}>Parse</button> { rawMessage }</td>
                        } else if (key === 'ad') {
                          const ad = event[key];
                          return <td><button onClick={ () => {
                            confirmAlert({
                              title: 'Address',
                              buttons: [
                                { label: 'Close' }
                              ],
                              message: <pre>{ JSON.stringify(ad, null, 4) }</pre>,
                            });
                          }}>Show</button> { ad.name && ad.name }</td>
                          // return <td><pre>...</pre></td>
                        } else if (
                            parseDates
                            && (key === 'd' && type === 'events'
                            || (key === 'date' || key === 'serverDate' && type === 'rawevents'))
                          ) {
                          return (
                            <td>{ formatDate(event[key]) }</td>
                          )  
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
      </div>
    )
  }
}

export default connect(
  state => ({
    type: state.view.toLowerCase(),
  })
)(Events);
