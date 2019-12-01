/* Copyright (c) 2016 Grant Miner */
"use strict";
/**
Uses Redux ( https://github.com/reactjs/redux ) to handle and keep all application state in one place.
*/
const NProgress = require('nprogress');
const toast = require('react-toastify').toast;
const redux = require("redux");
const compose = redux.compose;
const _ = require("lodash");
const Cookies = require("cookies-js");
const moment = require("moment");
const createLogger = require("redux-logger").createLogger;
const reducer = require("./appStateReducer");
const stopListening = require("./appSocketState").stopListening;

const setDatabaseConnected = require('./appStateActionCreators').setDatabaseConnected;
const setDatabaseDisconnected = require('./appStateActionCreators').setDatabaseDisconnected;

const logger = createLogger({
  duration: true,
  timestamp: true
});

const enhancers = [];
enhancers.push(redux.applyMiddleware(logger));

if (window.__REDUX_DEVTOOLS_EXTENSION__) {
  enhancers.push(window.__REDUX_DEVTOOLS_EXTENSION__());
}

const store = redux.createStore(
  reducer,
  undefined,
  compose(...enhancers)
);
module.exports.store = store;

if (Cookies.get("jwt")) {
  login();
}

function auth() {
  return {
    headers: headers()
    // 'credentials': 'include' // include JWT cookie
  };
}
module.exports.auth = auth;

function authWithCookies() {
  return {
    headers: headers(),
    credentials: "include" // include JWT cookie
  };
}

function headers() {
  const headers = {
    "content-type": "application/json; charset=UTF-8"
  };
  if (Cookies.get("jwt")) {
    headers["authorization"] = "Bearer " + Cookies.get("jwt");
  }
  return headers;
}

function authJson() {
  return {
    headers: headers()
  };
}

function put(obj) {
  return Object.assign({}, authJson(), {
    method: "PUT",
    body: JSON.stringify(obj)
  });
}

function post(obj) {
  return Object.assign({}, authJson(), {
    method: "POST",
    body: JSON.stringify(obj)
  });
}

function postWithCookies(obj) {
  return Object.assign({}, authWithCookies(), {
    method: "POST",
    body: JSON.stringify(obj)
  });
}

function validateResponse(response) {
  if (response.ok) {
    return response.json();
  } else {
    NProgress.done();
    return response.json().then(function(json) {
      let error = new Error();
      error.message = json.message;

      if (error.message === 'ReqlDriverError: None of the pools have an opened connection and failed to open a new one.') {
        toast.error('Unable to connect to database. Contact system administrator.', { autoClose: false, draggable: false });
        store.dispatch(setDatabaseDisconnected());
      } else {
        toast.error(error.message, {autoClose:false});
      }

      throw error;
    });
  }
}
module.exports.validateResponse = validateResponse;

function loadOrgState(orgid) {
  if (!orgid) {
    console.warn('Unnecessary loadOrgState');
    return Promise.resolve();
  }

  return fetch("/api/organizations/" + orgid, auth())
    .then(validateResponse)
    .then(org => {
      NProgress.inc();

      store.dispatch({
        type: "GET_ORG",
        org: org
      });

      NProgress.inc();

      const fleetp = fetch("/api/organizations/" + orgid + "/fleets", auth())
        .then(validateResponse)
        .then(function(fleets) {
          NProgress.inc();

          store.dispatch({
            type: "FLEETS",
            fleets: fleets
          });
        });

      // LOAD vehicle status
      const statusp = loadVehicles(orgid);

      // org users
      const usersp = fetch("/api/organizations/" + orgid + "/users", auth())
        .then(validateResponse)
        .then(users => {
          NProgress.inc();

          store.dispatch({
            type: "ORG_USERS",
            orgid: orgid,
            users: users
          });
        });
      return Promise.all([fleetp, statusp, usersp]).finally(NProgress.done);
    });
}
module.exports.loadOrgState = loadOrgState;

function loadVehicles(orgid) {
  NProgress.start();
  return fetch("/api/organizations/" + orgid + "/vehiclestatus", auth())
    .then(validateResponse)
    .then(vehicles => {
      store.dispatch({
        type: "VEHICLES",
        vehicles: vehicles,
        orgid: orgid
      });
    })
    .finally(NProgress.done);
}

function fetchOrganizations() {
  NProgress.inc();
  return fetch("/api/organizations/", auth())
    .then(validateResponse)
    .then(orgs => {
      store.dispatch({
        type: "ORGS",
        orgs: orgs
      });
    })
    .finally(NProgress.done);
}

function loadSiteAdminData() {
  // ALL ORGS
  let orgsp = fetchOrganizations();

  // LOAD USERS
  let usersp = fetch("/api/users/", auth())
    .then(validateResponse)
    .then(function(users) {
      NProgress.inc();
      store.dispatch({
        type: "USERS",
        users: users
      });
    });

  // LOAD devices
  let devicesp = fetch("/api/devices/", auth())
    .then(validateResponse)
    .then(function(devices) {
      NProgress.inc();
      store.dispatch({
        type: "DEVICES",
        devices: devices
      });
    });

  // LOAD all vehicles (needed for device <-> vehicle association)
  let vehiclesp = fetch("/api/vehicles/", auth())
    .then(validateResponse)
    .then(function(vehicles) {
      NProgress.inc();
      store.dispatch({
        type: "VEHICLES",
        vehicles: vehicles
      });
    });

  return Promise.all([orgsp, usersp, devicesp, vehiclesp]).then(function() {
    NProgress.done();
  });
}
function login(data) {
  // data is an object {username, password}
  NProgress.inc();

  let initial;
  if (data) {
    initial = fetch("/api/session/", postWithCookies(data));
  } else {
    initial = fetch("/api/session/", { headers: headers() });
  }

  return initial
    .then(validateResponse)
    .then(function(response) {
      const user = response.user;
      const isAdmin = user.isAdmin;
      let next; // sequence
      NProgress.inc();
      store.dispatch({
        type: "SESSION",
        user: user
      });

      if (isAdmin) {
        next = loadSiteAdminData();
      } else {
        next = fetchOrganizations();
      }

      next.finally(() => {
        NProgress.done();
      });

      return next;
    });
}
module.exports.login = login;

module.exports.logOut = function() {
  stopListening();
  
  return fetch(
      "/api/session",
      Object.assign(
        {
          method: "DELETE"
        },
        authWithCookies()
      )
    ).then(() => {
      Cookies.expire("jwt");
      store.dispatch({
        type: "LOGOUT"
      });
    });
};

module.exports.getState = function() {
  return store.getState();
};

module.exports.getStore = function() {
  return store;
};

module.exports.deleteOrg = function(org) {
  return fetch(
      "/api/organizations/" + org.id,
      Object.assign(auth(), {
        method: "DELETE"
      })
    )
    .then(validateResponse)
    .then(function() {
      store.dispatch({
        type: "DELETE_ORG",
        org: org
      });
    });
};

module.exports.deleteUser = function(user) {
  let url;
  if (user.orgid) {
    url = "/api/organizations/" + user.orgid + "/users/" + user.username;
  } else {
    url = "/api/users/" + user.username;
  }

  return fetch(
      url,
      Object.assign(auth(), {
        method: "DELETE"
      })
    )
    .then(validateResponse)
    .then(function() {
      store.dispatch({
        type: "DELETE_USER",
        user: user
      });
    });
};

module.exports.deleteDevice = function(device) {
  return fetch(
      "/api/devices/" + device.imei,
      Object.assign(
        {
          method: "DELETE"
        },
        auth()
      )
    )
    .then(validateResponse)
    .then(function() {
      store.dispatch({
        type: "DELETE_DEVICE",
        device: device
      });
    });
};

module.exports.deleteVehicle = function(vehicle) {
  let url;
  if (vehicle.orgid) {
    url = "/api/organizations/" + vehicle.orgid + "/vehicles/" + vehicle.id;
  } else {
    url = "/api/vehicles/" + vehicle.id;
  }

  return fetch(
      url,
      Object.assign(
        {
          method: "DELETE"
        },
        auth()
      )
    )
    .then(validateResponse)
    .then(function() {
      store.dispatch({
        type: "DELETE_VEHICLE",
        vehicle: vehicle
      });
    });
};

module.exports.saveFleet = function(fleet) {
  NProgress.start();

  if (fleet.id) {
    return fetch(
        "/api/organizations/" + fleet.orgid + "/fleets/" + fleet.id,
        put(fleet)
      )
      .then(validateResponse)
      .then(function(fleet) {
        store.dispatch({
          type: "SAVE_FLEET",
          fleet: fleet
        });
      })
      .finally(NProgress.done);
  } else {
    delete fleet.id;

    return fetch("/api/organizations/" + fleet.orgid + "/fleets/", post(fleet))
      .then(validateResponse)
      .then(function(fleet) {
        store.dispatch({
          type: "SAVE_FLEET",
          fleet: fleet
        });
      })
      .finally(NProgress.done);
  }
};

module.exports.deleteFleet = function(fleet) {
  NProgress.start();

  let url;
  if (fleet.orgid) {
    url = "/api/organizations/" + fleet.orgid + "/fleets/" + fleet.id;
  } else {
    url = "/api/fleet/" + fleet.id;
  }

  return fetch(
      url,
      Object.assign(
        {
          method: "DELETE"
        },
        auth()
      )
    )
    .then(function(response) {
      if (response.ok) {
        store.dispatch({
          type: "DELETE_FLEET",
          fleet: fleet
        });
      }

      return response;
    })
    .finally(function() {
      NProgress.done();
    });
};

module.exports.selectVehicleByID = function(id) {
  store.dispatch({
    type: "SELECT_VEHICLE",
    id: id
  });

  const state = store.getState();
  let retVal = Promise.resolve();
  let lastStatus;
  if (state.vehiclesByID[id]) {
    lastStatus = state.vehiclesByID[id].last;
    if (lastStatus != null && lastStatus.d) {
      retVal = selectDay(
        moment(lastStatus.d)
          .startOf("day")
          .toDate()
      );
    }
  }

  return retVal;
};

module.exports.saveOrg = function(org) {
  NProgress.start();

  if (org.id) {
    return fetch("/api/organizations/" + org.id, put(org))
      .then(function(response) {
        NProgress.inc();
        return validateResponse(response);
      })
      .then(function(org) {
        store.dispatch({
          type: "SAVE_ORG",
          org: org
        });
      })
      .finally(NProgress.done);
  } else {
    delete org.id;

    return fetch("/api/organizations/", post(org))
      .then(function(response) {
        NProgress.inc();
        return validateResponse(response);
      })
      .then(function(org) {
        store.dispatch({
          type: "SAVE_ORG",
          org: org
        });
      })
      .finally(NProgress.done);
  }
};
module.exports.saveUser = function(user) {
  NProgress.start();
  return fetch("/api/users/" + user.username, put(user))
    .then(function(response) {
      NProgress.inc();
      return validateResponse(response);
    })
    .then(function(org) {
      store.dispatch({
        type: "SAVE_USER",
        user: user
      });
    })
    .finally(NProgress.done);
};

module.exports.putVehicle = function(vehicle) {
  NProgress.start();
  return fetch(
      "/api/organizations/" + vehicle.orgid + "/vehicles/" + vehicle.id,
      put(vehicle)
    )
    .then(validateResponse)
    .then(vehicle => {
      store.dispatch({
        type: "SAVE_VEHICLE",
        vehicle: vehicle
      });
    })
    .finally(NProgress.done);
};

module.exports.postVehicle = function(vehicle) {
  NProgress.start();
  delete vehicle.id;

  return fetch("/api/organizations/" + vehicle.orgid + "/vehicles/", post(vehicle))
    .then(validateResponse)
    .then(vehicle => {
      store.dispatch({
        type: "SAVE_VEHICLE",
        vehicle: vehicle
      });
    })
    .finally(NProgress.done);
};

module.exports.saveDevice = function(device) {
  NProgress.start();
  return fetch("/api/devices/" + device.imei, put(device))
    .then(validateResponse)
    .then(device => {
      store.dispatch({
        type: "SAVE_DEVICE",
        device: device
      });
    })
    .finally(NProgress.done);
};

module.exports.clickItem = function(item) {
  store.dispatch({
    type: "SELECT_ITEM",
    item: item
  });
};

module.exports.selectDays = function(startDate, endDate) {
  store.dispatch({
    type: "SELECT_DAYS",
    startDate: startDate,
    endDate: endDate
  });
};

function selectDay(startDate) {
  startDate = moment(startDate);
  store.dispatch({
    type: "SELECT_DAYS",
    startDate: startDate,
    endDate: moment(startDate)
      .add(1, "days")
      .toDate()
  });
}
module.exports.selectDay = selectDay;


// module.exports.setShowVerbose = function(bool) {
//   store.dispatch({
//     type: "SHOWVERBOSE",
//     value: bool
//   });
// };

// module.exports.setShowLatLong = function(bool) {
//   store.dispatch({
//     type: "SHOWLATLONG",
//     value: bool
//   });
// };
