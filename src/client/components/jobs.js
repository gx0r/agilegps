import React, { useState, useEffect } from 'react';
import { auth, validateResponse, } from "../appState.js";
import { toast } from 'react-toastify';
import { includes } from 'lodash';

const blacklist = [
  'r.table("vehicles").pluck(["id", "device"]).changes({"includeInitial": true})', // listener vehicle updates
  'r.table("fleets").changes()',
  'r.table("errors").changes()',
  'r.table("vehicles").changes()',
  'r.table("devices").changes()',
  'r.table("organizations").changes()',
  'r.table("users").changes()',
  'r.table("vehiclehistory").changes()',
  'r.table("jobs").orderBy("duration_sec")',
  `r.db("rethinkdb")
 .table("server_status")
 .union(["feedSeparator"])
 .union(r.db("rethinkdb").table("server_status").changes())`
]

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [autoReload, setAutoReload] = useState(true);
  const [showAll, setShowAll] = useState(false);

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
            <span> </span>Show Application Critical: <input type="checkbox" checked={showAll} onChange={ev => setShowAll(ev.target.checked)} />
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
                { jobs
                .filter(job => {
                  if (showAll) {
                    return true;
                  } else {
                    return !includes(blacklist, job.info.query);
                  }
                })
                .map(job => <tr key={job.id.join('')}>
                  <td>{job.duration_sec}</td>
                  <td>{job.id[0]}</td>
                  <td>{job.id[1]}</td>
                  <td><pre>{job.info.query}</pre></td>
  <td>{ !includes(blacklist, job.info.query) && <button onClick={() => kill(job.id)} className="btn btn-sm btn-danger">Kill</button> }</td>
                </tr> )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
