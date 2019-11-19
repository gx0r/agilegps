/* Copyright (c) 2016 Grant Miner */
"use strict";
/**
Uses Redux ( https://github.com/reactjs/redux ) to handle and keep all application state in one place.
*/
const m = require("mithril");
const redux = require("redux");
const _ = require("lodash");
const Cookies = require("cookies-js");
const moment = require("moment");
const createLogger = require("redux-logger").createLogger;
const reducer = require("./appStateReducer");

const REDUX_LOGGING = false;
const logger = createLogger({
  duration: true,
  timestamp: true
});
const store = redux.createStore(
  reducer,
  REDUX_LOGGING ? redux.applyMiddleware(logger) : null
);

if (Cookies.get("jwt")) {
  setImmediate(function() {
    login();
  });
}

// START routing
let lastViewState = {};
store.subscribe(function() {
  let state = store.getState();
  let viewState = {};
  viewState.view = state.view;
  viewState.subview = state.subview;
  viewState.viewID = state.viewID;

  if (!_.isEqual(lastViewState, viewState)) {
    lastViewState = viewState;
    window.history.pushState(
      viewState,
      viewState.view + " " + viewState.subview + " " + viewState.viewID,
      "?" + JSON.stringify(viewState)
    );
  }
  if (["EDIT", "RAWEVENTS", "EVENTS", "EXCEPTIONS"].indexOf(state.subview) < 0) {
    // don't redraw certain views
    // console.log("redrawing");
    m.redraw();
  }
});

window.onpopstate = function(ev) {
  let location = ev.state;
  store.dispatch({
    type: "VIEW",
    view: location.view,
    subview: location.subview,
    viewID: location.viewID
  });
};
// END routing

function auth() {
  return {
    headers: headers()
    // 'credentials': 'include' // include JWT cookie
  };
}

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

function loadOrgState(orgid) {
  NProgress.inc();

  return Promise.resolve(fetch("/api/organizations/" + orgid, auth()))
    .then(function(response) {
      return validateResponse(response);
    })
    .then(function(org) {
      NProgress.inc();

      store.dispatch({
        type: "GET_ORG",
        org: org
      });

      NProgress.inc();

      let fleetp = Promise.resolve(
        fetch("/api/organizations/" + orgid + "/fleets", auth())
      )
        .then(function(response) {
          return validateResponse(response);
        })
        .then(function(fleets) {
          NProgress.inc();

          store.dispatch({
            type: "FLEETS",
            fleets: fleets
          });
        });

      // LOAD vehicle status
      let statusp = loadVehicles(orgid);

      // org users
      let usersp = Promise.resolve(
        fetch("/api/organizations/" + orgid + "/users", auth())
      )
        .then(function(response) {
          return validateResponse(response);
        })
        .then(function(users) {
          NProgress.inc();

          store.dispatch({
            type: "ORG_USERS",
            orgid: orgid,
            users: users
          });
        });
      return Promise.all([fleetp, statusp, usersp]);
    });
}

function loadVehicles(orgid) {
  NProgress.start();
  return Promise.resolve(
    fetch("/api/organizations/" + orgid + "/vehiclestatus", auth())
  )
    .then(function(response) {
      NProgress.inc();
      return validateResponse(response);
    })
    .then(function(vehicles) {
      store.dispatch({
        type: "VEHICLES",
        vehicles: vehicles,
        orgid: orgid
      });
    })
    .finally(function() {
      NProgress.done();
    });
}

function fetchOrganizations() {
  NProgress.inc();
  return Promise.resolve(fetch("/api/organizations/", auth()))
    .then(function(response) {
      NProgress.inc();
      return validateResponse(response);
    })
    .then(function(orgs) {
      store.dispatch({
        type: "ORGS",
        orgs: orgs
      });
    })
    .finally(function() {
      NProgress.done();
    });
}

function loadSiteAdminData() {
  // ALL ORGS
  let orgsp = fetchOrganizations();

  // LOAD USERS
  let usersp = Promise.resolve(fetch("/api/users/", auth()))
    .then(function(response) {
      NProgress.inc();
      return validateResponse(response);
    })
    .then(function(users) {
      NProgress.inc();
      store.dispatch({
        type: "USERS",
        users: users
      });
    });

  // LOAD devices
  let devicesp = fetch("/api/devices/", auth())
    .then(function(response) {
      NProgress.inc();
      return validateResponse(response);
    })
    .then(function(devices) {
      NProgress.inc();
      store.dispatch({
        type: "DEVICES",
        devices: devices
      });
    });

  // LOAD all vehicles (needed for device <-> vehicle association)
  let vehiclesp = Promise.resolve(fetch("/api/vehicles/", auth()))
    .then(function(response) {
      NProgress.inc();
      return validateResponse(response);
    })
    .then(function(vehicles) {
      NProgress.inc();
      store.dispatch({
        type: "VEHICLES",
        vehicles: vehicles
      });
    });

  return Promise.all([orgsp, usersp, devicesp, vehiclesp]).then(function() {
    NProgress.inc();
  });
}

function afterLogin() {}

function viewLogin() {
  store.dispatch({
    type: "VIEW",
    view: "SESSION"
  });
}
module.exports.viewLogin = viewLogin;

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
    .then(function(response) {
      NProgress.inc();
      return validateResponse(response);
    })
    .then(function(response) {
      const user = response.user;
      const orgid = user.orgid;
      const isAdmin = user.isAdmin;
      const viewID = store.getState().viewID
      const view = store.getState().view; // main view
      const subview = store.getState().subview; // sub view
      let next; // sequence
      NProgress.inc();
      store.dispatch({
        type: "SESSION",
        user: user
      });

      if (isAdmin) {
        next = loadSiteAdminData();
      } else {
        next = fetchOrganizations().then(() => {
          if (orgid) {
            return selectOrgByID(orgid);
          }
        });
      }

      if (subview === "ORG" && viewID) {
        next = next.then(() => {
          return selectOrgByID(viewID);
        });
      } 

      if (view === "ORG" && viewID && isAdmin) { // TODO make better
        next = next.then(() => {
          return selectOrgByID(viewID);
        });
      } else if (orgid != null && !isAdmin) {
        next = next.then(() =>{
          return selectOrgByID(orgid);
        });
      }

      next.finally(() => {
        NProgress.done();
        m.redraw();
      });

      return next;
    });
}
module.exports.login = login;

module.exports.logOut = function() {
  return Promise.resolve(
    fetch(
      "/api/session",
      Object.assign(
        {
          method: "DELETE"
        },
        authWithCookies()
      )
    )
  ).then(function(response) {
    Cookies.expire("jwt");
    store.dispatch({
      type: "LOGOUT"
    });
    return viewLogin();
  });
};

module.exports.getState = function() {
  return store.getState();
};

module.exports.getStore = function() {
  return store;
};

module.exports.getOrgName = function(id) {
  let org = store.getState().orgsByID[id];
  return org ? org.name : "";
};

function selectFleetAll() {
  store.dispatch({
    type: "SELECT_FLEET_ALL"
  });

  return Promise.resolve();
}
module.exports.selectFleetAll = selectFleetAll;

function selectOrgByID(orgid) {
  NProgress.inc();

  let org = store.getState().orgsByID[orgid];

  if (!org) {
    org = store.getState().user.orgid; // TODO fix this hack
    console.warn('FIXME: missing orgid in selectOrgByID');
  }

  store.dispatch({
    type: "SELECT_ORG",
    org: org
  });

  return loadOrgState(orgid)
    .then(function() {
      return selectFleetAll();
    })
    .finally(function() {
      NProgress.done();
    });
}
module.exports.selectOrgByID = selectOrgByID;

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
    encodeURIComponent(state.startDate.toISOString()) +
    "&endDate=" +
    encodeURIComponent(state.endDate.toISOString());

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
  let state = store.getState();

  store.dispatch({
    type: "SELECT_VEHICLE",
    id: id
  });

  let lastStatus;
  if (state.vehiclesByID[id]) {
    lastStatus = state.vehiclesByID[id].last;
  }

  if (lastStatus != null && lastStatus.d) {
    return selectDay(
      moment(lastStatus.d)
        .startOf("day")
        .toDate()
    );
  }
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

module.exports.changePage = function(pageNum) {
  store.dispatch({
    type: "CHANGE_EVENTS_PAGE",
    page: pageNum
  });
  return updateEvents();
};

module.exports.changePageSize = function(size) {
  store.dispatch({
    type: "CHANGE_EVENTS_PAGE_SIZE",
    size: size
  });
  return updateEvents();
};

module.exports.changePageSearch = function(search) {
  store.dispatch({
    type: "CHANGE_EVENTS_PAGE_SEARCH",
    search: search
  });
  return updateEvents();
};

module.exports.viewEvents = function() {
  store.dispatch({
    type: "VIEW",
    view: "EVENTS",
    subview: "ALL",
    viewID: ""
  });
  return updateEvents();
};

module.exports.viewRawEvents = function() {
  store.dispatch({
    type: "VIEW",
    view: "RAWEVENTS",
    subview: "ALL",
    viewID: ""
  });
  return updateEvents();
};

module.exports.viewExceptions = function() {
  store.dispatch({
    type: "VIEW",
    view: "EXCEPTIONS",
    subview: "ALL",
    viewID: ""
  });
  return updateEvents();
};

module.exports.viewHelp = function() {
  store.dispatch({
    type: "VIEW",
    view: "HELP",
    subview: "ALL",
    viewID: ""
  });
};

module.exports.viewOrgByID = function(id) {
  store.dispatch({
    type: "VIEW",
    view: "ORG",
    viewID: id,
    subview: "SPLIT"
  });
  m.redraw();
};

function viewOrganizations() {
  store.dispatch({
    type: "VIEW",
    view: "ORG",
    subview: "ALL",
    viewID: ""
  });
}
module.exports.viewOrganizations = viewOrganizations;

const viewUsers = module.exports.viewUsers = function() {
  store.dispatch({
    type: "VIEW",
    view: "USER",
    subview: "ALL",
    viewID: ""
  });
};

module.exports.viewOrgUsers = function() {
  let state = store.getState();

  store.dispatch({
    type: "VIEW",
    view: "USER",
    subview: "ORG",
    viewID: state.selectedOrg.id
  });
};

module.exports.viewOrgFleets = function() {
  let state = store.getState();

  store.dispatch({
    type: "VIEW",
    view: "FLEET",
    subview: "ORG",
    viewID: state.selectedOrg.id
  });
};

module.exports.viewOrgVehicles = function() {
  let state = store.getState();

  store.dispatch({
    type: "VIEW",
    view: "VEHICLE",
    subview: "ORG",
    viewID: state.selectedOrg.id
  });
};

module.exports.viewDevices = function() {
  store.dispatch({
    type: "VIEW",
    view: "DEVICE",
    subview: "ALL",
    viewID: ""
  });
};

module.exports.viewNewOrganization = function() {
  store.dispatch({
    type: "VIEW",
    view: "ORG",
    subview: "NEW",
    viewID: ""
  });
};

module.exports.viewNewDevice = function() {
  store.dispatch({
    type: "VIEW",
    view: "DEVICE",
    subview: "NEW",
    viewID: ""
  });
};

module.exports.viewNewUser = function() {
  store.dispatch({
    type: "VIEW",
    view: "USER",
    subview: "NEW",
    viewID: ""
  });
};

module.exports.viewNewVehicle = function() {
  store.dispatch({
    type: "VIEW",
    view: "VEHICLE",
    subview: "NEW",
    viewID: ""
  });
};

module.exports.viewVehicleByID = function(id) {
  store.dispatch({
    type: "VIEW",
    view: "VEHICLE",
    subview: "EDIT",
    viewID: id
  });
};

module.exports.viewDevices = function() {
  store.dispatch({
    type: "VIEW",
    view: "DEVICE",
    subview: "ALL",
    viewID: ""
  });
};

module.exports.viewDeviceByID = function(id) {
  store.dispatch({
    type: "VIEW",
    view: "DEVICE",
    subview: "EDIT",
    viewID: id
  });
};

module.exports.viewUserByID = function(id) {
  store.dispatch({
    type: "VIEW",
    view: "USER",
    subview: "EDIT",
    viewID: id
  });
};

module.exports.viewReports = function() {
  store.dispatch({
    type: "VIEW_REPORTS"
  });
};

module.exports.viewMap = function() {
  store.dispatch({
    type: "VIEW_MAP"
  });
};

module.exports.viewSplitScreen = function() {
  store.dispatch({
    type: "VIEW_SPLIT_SCREEN"
  });
};

module.exports.editOrganization = function(id) {
  store.dispatch({
    type: "VIEW",
    view: "ORG",
    subview: "EDIT",
    viewID: id
  });
};

module.exports.setAutoUpdate = function(bool) {
  store.dispatch({
    type: "AUTOUPDATE",
    value: bool
  });
};

module.exports.setShowVerbose = function(bool) {
  store.dispatch({
    type: "SHOWVERBOSE",
    value: bool
  });
};

module.exports.setShowLatLong = function(bool) {
  store.dispatch({
    type: "SHOWLATLONG",
    value: bool
  });
};

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
