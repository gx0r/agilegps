import React, { useState, useEffect } from 'react';
import { auth, validateResponse, } from "../appState.js";
import { toast } from 'react-toastify';

export default function Stats() {
  const [stats, setStats] = useState([]);
  const [autoReload, setAutoReload] = useState(true);

  useEffect(() => {
    if (autoReload) {
      const doLoad = () => {
        fetch("/api/dbstats", auth())
        .then(validateResponse)
        .then(stats => {
          setStats(stats)
        })
      }
      doLoad();
      const timer = setInterval(doLoad, 2000);
      return () => clearInterval(timer);  
    }
  }, [autoReload]);

  return (
    <div className="container-fluid">
      <div className="row">
        <div>
          <div className="business-table col-sm-12">
            Auto Update: <input type="checkbox" checked={autoReload} onChange={ev => setAutoReload(ev.target.checked)} />
            <h4>Database Stats</h4>
            <table className="table-condensed table-bordered table-striped dataTable">
              <thead>
                <tr>
                  <td>ID</td>
                  <td>DB</td>
                  <td>Table</td>
                  <td>Server</td>
                  <td>Query Engine</td>
                  <td>Storage Engine</td>
                </tr>
              </thead>
              <tbody>
                { stats && stats.map(stat => <tr key={stat.id}>
                  <td><pre>{stat.id && JSON.stringify(stat.id, null, 4)}</pre></td>
                  <td><pre>{stat.db && JSON.stringify(stat.db, null, 4)}</pre></td>
                  <td><pre>{stat.table && JSON.stringify(stat.table, null, 4)}</pre></td>
                  <td><pre>{stat.server && JSON.stringify(stat.server, null, 4)}</pre></td>                  
                  <td><pre>{stat.query_engine && JSON.stringify(stat.query_engine, null, 4)}</pre></td>                  
                  <td><pre>{stat.storage_engine && JSON.stringify(stat.storage_engine, null, 4)}</pre></td>                  
                  {/* <td><pre>{JSON.stringify(stat, null, 4)}</pre></td>                   */}
                </tr> )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
