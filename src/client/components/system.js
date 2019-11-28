import React, { useState, useEffect } from 'react';
import { auth, validateResponse, } from "../appState.js";

export default function System() {
  const [jobs, setJobs] = useState([]);
  const [autoReload, setAutoReload] = useState(true);

  useEffect(() => {
    if (autoReload) {
      const doLoad = () => {
        fetch("/api/dbjobs", auth())
        .then(validateResponse)
        .then(jobs => {
          setJobs(jobs)
        })
      }
      doLoad();
      const timer = setInterval(doLoad, 250);
      return () => clearInterval(timer);  
    }
  }, [autoReload]);

  return (
    <div className="container-fluid">
      <div className="row">
        <div>
          <div className="col-sm-2"></div>
          <div className="business-table col-sm-8">
            Auto Update: <input type="checkbox" checked={autoReload} onChange={ev => setAutoReload(ev.target.checked)} />
            <h4>DB Jobs (updates automatically)</h4>
            <table className="table-condensed table-bordered table-striped dataTable">
              <thead>
                <tr>
                  <td>Duration (s)</td>
                  <td>Type</td>
                  <td>ID</td>
                  <td>Query</td>
                </tr>
              </thead>
              <tbody>
                { jobs.map(job => <tr key={job.id.join('')}>
                  <td>{job.duration_sec}</td>
                  <td>{job.id[0]}</td>
                  <td>{job.id[1]}</td>
                  <td><pre>{job.info.query}</pre></td>
                </tr> )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
