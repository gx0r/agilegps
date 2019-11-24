/* Copyright (c) 2016 Grant Miner */
"use strict";
/**
Uses Redux ( https://github.com/reactjs/redux ) to handle and keep all application state in one place.
*/
const redux = require("redux");
const compose = redux.compose;
const _ = require("lodash");
const Cookies = require("cookies-js");
const moment = require("moment");
const createLogger = require("redux-logger").createLogger;
const reducer = require("./appStateReducer");
const stopListening = require("./appSocketState").stopListening;

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
  return Promise.resolve(fetch("/api/organizations/", auth()))
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
  let usersp = Promise.resolve(fetch("/api/users/", auth()))
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
  let vehiclesp = Promise.resolve(fetch("/api/vehicles/", auth()))
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
    initial = Promise.resolve(fetch("/api/session/", postWithCookies(data)));
  } else {
    initial = Promise.resolve(fetch("/api/session/", { headers: headers() }));
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

function selectFleetAll() {
  store.dispatch({
    type: "SELECT_FLEET_ALL"
  });

  return Promise.resolve();
}
module.exports.selectFleetAll = selectFleetAll;

module.exports.deleteOrg = function(org) {
  return Promise.resolve(
    fetch(
      "/api/organizations/" + org.id,
      Object.assign(auth(), {
        method: "DELETE"
      })
    )
  )
    .then(function(response) {
      return validateResponse(response);
    })
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

  return Promise.resolve(
    fetch(
      url,
      Object.assign(auth(), {
        method: "DELETE"
      })
    )
  )
    .then(function(response) {
      return validateResponse(response);
    })
    .then(function() {
      store.dispatch({
        type: "DELETE_USER",
        user: user
      });
    });
};

module.exports.deleteDevice = function(device) {
  return Promise.resolve(
    fetch(
      "/api/devices/" + device.imei,
      Object.assign(
        {
          method: "DELETE"
        },
        auth()
      )
    )
  )
    .then(function(response) {
      return validateResponse(response);
    })
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

  return Promise.resolve(
    fetch(
      url,
      Object.assign(
        {
          method: "DELETE"
        },
        auth()
      )
    )
  )
    .then(function(response) {
      return validateResponse(response);
    })
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
    return Promise.resolve(
      fetch(
        "/api/organizations/" + fleet.orgid + "/fleets/" + fleet.id,
        put(fleet)
      )
    )
      .then(function(response) {
        NProgress.inc();
        return validateResponse(response);
      })
      .then(function(fleet) {
        store.dispatch({
          type: "SAVE_FLEET",
          fleet: fleet
        });
      })
      .finally(function() {
        NProgress.done();
      });
  } else {
    delete fleet.id;

    return Promise.resolve(
      fetch("/api/organizations/" + fleet.orgid + "/fleets/", post(fleet))
    )
      .then(function(response) {
        NProgress.inc();
        return validateResponse(response);
      })
      .then(function(fleet) {
        store.dispatch({
          type: "SAVE_FLEET",
          fleet: fleet
        });
      })
      .finally(function() {
        NProgress.done();
      });
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

  return Promise.resolve(
    fetch(
      url,
      Object.assign(
        {
          method: "DELETE"
        },
        auth()
      )
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

module.exports.selectFleet = function(fleet) {
  store.dispatch({
    type: "SELECT_FLEET",
    fleet: fleet
  });
};

function updateSelectedVehicleHistory() {
  NProgress.start();
  let state = store.getState();
  let vehicle = state.selectedVehicle;

  let url =
    "/api/organizations/" +
    vehicle.orgid +
    "/vehiclehistory/" +
    vehicle.id +
    "?startDate=" +
    encodeURIComponent(state.startDate.toISOString(true)) +
    "&endDate=" +
    encodeURIComponent(state.endDate.toISOString(true));

  return Promise.resolve(fetch(url, auth()))
    .then(function(response) {
      NProgress.inc();
      return validateResponse(response);
    })
    .then(function(history) {
      store.dispatch({
        type: "VEHICLE_HISTORY",
        vehicle: vehicle,
        history: history
      });
    })
    .finally(function() {
      NProgress.done();
    });
}
module.exports.updateSelectedVehicleHistory = updateSelectedVehicleHistory;

function update() {
  let state = store.getState();

  if (state.selectedVehicle) {
    return updateSelectedVehicleHistory();
  } else {
    return loadVehicles(state.selectedOrg.id);
  }
}
module.exports.update = update;

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
    return Promise.resolve(fetch("/api/organizations/" + org.id, put(org)))
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
      .finally(function() {
        NProgress.done();
      });
  } else {
    delete org.id;

    return Promise.resolve(fetch("/api/organizations/", post(org)))
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
      .finally(function() {
        NProgress.done();
      });
  }
};
module.exports.saveUser = function(user) {
  NProgress.start();
  return Promise.resolve(fetch("/api/users/" + user.username, put(user)))
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
    .finally(function() {
      NProgress.done();
    });
};

module.exports.putVehicle = function(vehicle) {
  NProgress.start();
  return Promise.resolve(
    fetch(
      "/api/organizations/" + vehicle.orgid + "/vehicles/" + vehicle.id,
      put(vehicle)
    )
  )
    .then(function(response) {
      NProgress.inc();
      return validateResponse(response);
    })
    .then(function(vehicle) {
      store.dispatch({
        type: "SAVE_VEHICLE",
        vehicle: vehicle
      });
    })
    .finally(function() {
      NProgress.done();
    });
};

module.exports.postVehicle = function(vehicle) {
  NProgress.start();
  delete vehicle.id;

  return Promise.resolve(
    fetch("/api/organizations/" + vehicle.orgid + "/vehicles/", post(vehicle))
  )
    .then(function(response) {
      NProgress.inc();
      return validateResponse(response);
    })
    .then(function(vehicle) {
      store.dispatch({
        type: "SAVE_VEHICLE",
        vehicle: vehicle
      });
    })
    .finally(function() {
      NProgress.done();
    });
};

module.exports.saveDevice = function(device) {
  NProgress.start();
  return Promise.resolve(fetch("/api/devices/" + device.imei, put(device)))
    .then(function(response) {
      NProgress.inc();
      return validateResponse(response);
    })
    .then(function(device) {
      store.dispatch({
        type: "SAVE_DEVICE",
        device: device
      });
    })
    .finally(function() {
      NProgress.done();
    });
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

  return updateSelectedVehicleHistory();
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

  return updateSelectedVehicleHistory();
}
module.exports.selectDay = selectDay;

function updateEvents() {
  NProgress.start();

  let state = store.getState();
  let type = _.lowerCase(state.view);
  NProgress.start();

  return Promise.resolve(
    fetch(
      "/api/count/" +
        type +
        (type === "rawevents"
          ? "?search=" + encodeURIComponent(state.search)
          : ""),
      auth()
    )
  )
    .then(function(response) {
      NProgress.inc();
      return validateResponse(response);
    })
    .then(function(result) {
      NProgress.inc();
      store.dispatch({
        type: "EVENT_COUNT",
        count: result.count
      });
    })
    .then(function() {
      let url =
        "/api/" +
        type +
        "/?page=" +
        state.page +
        "&pagesize=" +
        state.pagesize +
        "&search=" +
        encodeURIComponent(state.search);
      return Promise.resolve(fetch(url, auth()));
    })
    .then(function(response) {
      NProgress.inc();
      return validateResponse(response);
    })
    .then(function(events) {
      store.dispatch({
        type: "EVENTS",
        events: events
      });
    })
    .finally(function() {
      NProgress.done();
    });
}
module.exports.updateEvents = updateEvents;

module.exports.setAutoUpdate = function(bool) {
  store.dispatch({
    type: "AUTOUPDATE",
    value: bool
  });
};

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

module.exports.setMap = function(map) {
  store.dispatch({
    type: "SET_MAP",
    value: map
  });
}

module.exports.setMarkersByVehicleID = function(markers) {
  store.dispatch({
    type: "SET_MARKERS_BY_VEHICLE_ID",
    value: markers
  });
}

module.exports.selectMapVehicleID = function(id) {
  store.dispatch({
    type: "SET_MAP_VEHICLE",
    value: id
  });
}

// vehicle page history item row
module.exports.selectHistoryItemID = function(id) {
  store.dispatch({
    type: "SET_HISTORY_ITEM_ID",
    value: id
  });
}
