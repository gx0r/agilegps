'use strict';

module.exports = {
    host: "0.0.0.0", // listen on host
    port: 33333, // UDP listen port

    relayTo: [
      // forward/relay messages to additional UDP sockets
      { host: "localhost", port: 8871 }
    ],

    insertrawevents: true, // insert the raw events to the DB

    geocode: true, // reverse geocode on or off
    sack: true, // send SACK on or off

}
