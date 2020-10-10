import React, { useState, useEffect} from 'react';

import moment from 'moment';
import { auth, validateResponse, } from "../appState.js";
import * as formatDate from "../formatDate";
import NProgress from 'nprogress';

export default function Errors(){
  const [count, setCount] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [pageSize, setPageSize] = useState(30);
  const [parseDates, setParseDates] = useState(true);

  useEffect(() => {
    NProgress.start();
    setLoading(true);
    setCount(null);

    fetch('/api/count/exceptions/', auth())
      .then(validateResponse)
      .then(result => {
        NProgress.inc();
        setCount(result.count);
      })
      .then(() => {
        return fetch(`/api/exceptions/?page=${page}&pageSize=${pageSize}`, auth());
      })
      .then(validateResponse)
      .then(events => setEvents(events))
      .finally(()=> {
        NProgress.done();
        setLoading(false);
      });
  }, [page, pageSize]);

  useEffect(() => {
    setPages(Math.ceil(count / pageSize));
  }, [count, pageSize]);

  const renderPagination = () => {
    const elements = [];
    for (let i = 1; i < pages + 1 && i <= 10; i++) {
      elements.push(
        <li key={ i }
        >
          <a
            className="pointer"
            onClick={ () => {
              setPage(i);
            } }
          >{ i }</a>
        </li>
      );
    }
    elements.push(<li key={ 'nextPage' }>
      <a className="pointer" onClick={ () => {
        setPage(page + 1);
      } }>»</a>
    </li>)

    return <ul className="pagination">{ elements }</ul>;
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col">
          <label className="control-label col-sm-1">
            Selected Page 
            <input
              className="form-control"
              onChange={ ev => setPage(parseInt(ev.target.value, 10)) }
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
              onChange={ ev => setPageSize(parseInt(ev.target.value, 10)) }
              type="number"
              value={ pageSize }
            />
          </label>
          <label className="control-label col-sm-2">
            Parse Dates to Local
            <input
              className="form-control"
              checked={ parseDates }
              onChange={ ev => setParseDates(ev.target.checked) }
              type="checkbox"
            />
          </label>
          <label className="control-label">
            <button
              className="btn btn-default btn-success"
              disabled={ loading }
              // onClick={ this.updateEvents }
              style={{
                marginRight: '1em',
              }}
            >Refresh</button>
          </label>
          <div>
          { `${count} (${pages} pages)` }
          </div>
          { renderPagination() }
        </div>
      </div>
      <div className="row">
        <table className="table table-bordered table-striped business-table">
          <thead>
            <tr>
              <td>Host</td>
              <td>Date</td>
              <td>Stack</td>
              <td>Load</td>
              <td>Memory</td>
              <td>PID</td>
              <td>UID</td>
              <td>Uptime</td>
              <td>argv</td>
              <td>CWD</td>
              <td>ID</td>
            </tr>
          </thead>
          <tbody>
            {
              events.map(event => <tr key={event.id}>
                <td>{event.host}</td>
                <td>{ parseDates ? formatDate(event.d) : moment(event.d).toISOString() }</td>
                <td><pre>{event.stack}</pre></td>
                <td><pre>{JSON.stringify(event.load, null, 4)}</pre></td>
                <td><pre>{JSON.stringify(event.memory, null, 4)}</pre></td>
                <td>{event.pid}</td>
                <td>{event.uid}</td>
                <td>{event.uptime}</td>
                <td><pre>{JSON.stringify(event.argv, null, 4)}</pre></td>
                <td>{event.cwd}</td>
                <td>{event.id}</td>
              </tr>)
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}

