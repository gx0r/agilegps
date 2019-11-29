import * as React from 'react';
import { version } from '../../../package.json';

export default class Help extends React.Component {

  render() {
    return (
      <div className="container-fluid">
        <div className="row">
          <div>
            <div className="col-sm-2"></div>
            <div className="business-table col-sm-8">
              <h4>Version</h4>
              <div>{version}</div>
              <h4>Why don't I see fuel level for my vehicle?</h4>
              <div>It depends on the vehicle. Not all vehicles report their fuel level.</div>
              <h4>What does the battery level indicate?</h4>
              <div>The battery power of the GPS tracking device.</div>
              <h4>What does the mileage column for ignition events indicate?</h4>
              <div>The duration, in the format of HH:MM:SS, is time spent with the ignition in the prior state. For example,
                if the status is "ign off", this means the ignition was turned off. The duration then shows how long the
                ignition ran (prior to being turned off). If the status is "Ign on," the time duration indicates how long the
                ignition was off.</div>
              <h4>What does "verbose" show?</h4>
              <div>This shows the odometer and engine hours columns, as well as displaying more detailed informational
                messages from the trackers.</div>
              <h4>What is a harsh status?</h4>
              <div>The tracking device detected what it was programmed to be harsh acceleration, braking, or turning.</div>
              <h4>What is advanced mode?</h4>
              <div>This is toggled on a user's profile, and enables extra options in the vehicle history view.</div>
              <h4>In advanced mode, what does calculate distances between mean?</h4>
              <div>The mileage column shows mileage changed between events, then a vertical bar, then the trip mileage. E.g.,
                6|18 means the vehicle moved 6 miles and the trip mileage is at 18. The trips are normally calculated as
                distance between starts and stops, but you can have it calculated between ignition on and off instead.</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
