import React, { useState, useEffect } from 'react';
import { auth, validateResponse, } from "../appState.js";
import { toast } from 'react-toastify';

export default function System() {
  const [jobs, setJobs] = useState([]);
  const [autoReload, setAutoReload] = useState(true);

  const kill = id => {
    fetch(`/api/dbjob/${JSON.stringify(id)}`, {
      ...auth(),
      method: "DELETE",
    })
      .then(validateResponse)
      .then(() => {
        toast(`Killed job ${id}`);
      })
  }

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
            <h4>Database Jobs</h4>
            <table className="table-condensed table-bordered table-striped dataTable">
              <thead>
                <tr>
                  <td>Duration (s)</td>
                  <td>Type</td>
                  <td>ID</td>
                  <td>Query</td>
                  <td>Actions</td>
                </tr>
              </thead>
              <tbody>
                { jobs.map(job => <tr key={job.id.join('')}>
                  <td>{job.duration_sec}</td>
                  <td>{job.id[0]}</td>
                  <td>{job.id[1]}</td>
                  <td><pre>{job.info.query}</pre></td>
                  <td><button onClick={() => kill(job.id)} className="btn btn-sm btn-danger">Kill</button></td>
                </tr> )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
