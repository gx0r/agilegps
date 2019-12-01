/* Copyright (c) 2016 Grant Miner */
"use strict";
// Reducer for Redux
const defaultState = require("./appDefaultState");

module.exports = function reducer(state = defaultState, action) {
  const newState = {};

  switch (action.type) {

    case "LOGOUT":
      return Object.assign({}, defaultState);

    case "SESSION":
      return Object.assign({}, state, { user: action.user });

    case "GET_ORG":
      var orgsByID = _.cloneDeep(state.orgsByID);
      orgsByID[action.org.id] = action.org;
      return Object.assign({}, state, { orgsByID: orgsByID });

    case "SELECT_FLEET":
      newState.impliedSelectedVehiclesByID = {};
      newState.selectedFleets = [action.fleet];
      newState.selectedAllFleets = false;
      newState.selectedVehicle = null;

      newState.selectedFleets.forEach(fleet => {
        fleet.vehicles.forEach(vid => {
          newState.impliedSelectedVehiclesByID[vid] = state.vehiclesByID[vid];
        });
      });

      return Object.assign({}, state, newState);

    case "SELECT_FLEET_ALL":
      newState.selectedFleets = _.cloneDeep(_.toArray(state.fleetsByID));
      newState.impliedSelectedVehiclesByID = {};
      newState.selectedAllFleets = true;
      newState.selectedVehicle = null;
      newState.selectedFleets.forEach(fleet => {
        fleet.vehicles.forEach(vid => {
          newState.impliedSelectedVehiclesByID[vid] = state.vehiclesByID[vid];
        });
      });
      return Object.assign({}, state, newState);

    case "SELECT_VEHICLE":
      return Object.assign({}, state, {
        selectedVehicle: state.vehiclesByID[action.id],
        impliedSelectedVehiclesByID: {
          [action.id]: state.vehiclesByID[action.id],
        },
        selectedAllFleets: false,
        selectedFleets: [],
        selectedVehicleHistory: []
      });

    case "USERS":
      var usersByID = {};
      action.users.forEach(function(user) {
        usersByID[user.username] = user;
      });
      return Object.assign({}, state, { usersByID: usersByID });

    case "VEHICLES":
      var vehiclesByID = {};
      action.vehicles.forEach(function(vehicle) {
        vehiclesByID[vehicle.id] = vehicle;
      });
      return Object.assign({}, state, {
        vehicles: action.vehicles,
        vehiclesByID: vehiclesByID,
        lastUpdated: new Date()
      });

    case "ORG_USERS":
      var usersByID = _.cloneDeep(state.usersByID);
      action.users.forEach(function(user) {
        usersByID[user.username] = user;
      });
      return Object.assign({}, state, { usersByID: usersByID });

    case "ORGS":
      var orgs = action.orgs;
      var orgsByID = {};
      orgs.forEach(function(org) {
        orgsByID[org.id] = org;
      });
      return Object.assign({}, state, { orgsByID: orgsByID });

    case "SAVE_ORG":
      var orgsByID = _.cloneDeep(state.orgsByID);
      orgsByID[action.org.id] = action.org;
      return Object.assign({}, state, { orgsByID: orgsByID });

    case "SAVE_USER":
      var usersByID = _.cloneDeep(state.usersByID);
      usersByID[action.user.username] = action.user;
      var me = state.user;
      if (action.user.username === me.username) {
        me = action.user;
      }
      return Object.assign({}, state, {
        usersByID: usersByID,
        user: me
      });

    case "SAVE_VEHICLE":
      var vehiclesByID = _.cloneDeep(state.vehiclesByID);
      vehiclesByID[action.vehicle.id] = action.vehicle;

      var impliedSelectedVehiclesByID = state.impliedSelectedVehiclesByID;
      if (impliedSelectedVehiclesByID[action.vehicle.id]) {
        impliedSelectedVehiclesByID[action.vehicle.id] = action.vehicle;
      }

      return Object.assign({}, state, {
        vehiclesByID: vehiclesByID,
        impliedSelectedVehiclesByID: impliedSelectedVehiclesByID
      });

    case "DELETE_VEHICLE":
      var vehiclesByID = _.cloneDeep(state.vehiclesByID);
      delete vehiclesByID[action.vehicle.id];

      var impliedSelectedVehiclesByID = state.impliedSelectedVehiclesByID;
      delete impliedSelectedVehiclesByID[action.vehicle.id];

      return Object.assign({}, state, {
        vehiclesByID: vehiclesByID,
        impliedSelectedVehiclesByID: impliedSelectedVehiclesByID
      });

    case "DELETE_USER":
      var usersByID = _.cloneDeep(state.usersByID);
      delete usersByID[action.user.username];
      return Object.assign({}, state, { usersByID: usersByID });

    case "DELETE_ORG":
      var orgsByID = _.cloneDeep(state.orgsByID);
      delete orgsByID[action.org.id];
      return Object.assign({}, state, { orgsByID: orgsByID });

    case "SAVE_DEVICE":
      var devicesByID = _.cloneDeep(state.devicesByID);
      devicesByID[action.device.imei] = action.device;
      return Object.assign({}, state, { devicesByID: devicesByID });

    case "DELETE_DEVICE":
      var devicesByID = _.cloneDeep(state.devicesByID);
      delete devicesByID[action.device.imei];
      return Object.assign({}, state, { devicesByID: devicesByID });

    case "DEVICES":
      var devices = action.devices;
      var devicesByID = {};
      devices.forEach(function(device) {
        devicesByID[device.imei] = device;
      });
      return Object.assign({}, state, { devicesByID: devicesByID });

    case "FLEETS":
      var fleets = action.fleets;
      var fleetsByID = {};
      fleets.forEach(function(fleet) {
        fleetsByID[fleet.id] = fleet;
      });
      return Object.assign({}, state, { fleetsByID: fleetsByID });

    case "DELETE_FLEET":
      var fleetsByID = _.cloneDeep(state.fleetsByID);
      delete fleetsByID[action.fleet.id];
      return Object.assign({}, state, { fleetsByID: fleetsByID });

    case "SAVE_FLEET":
      var fleetsByID = _.cloneDeep(state.fleetsByID);
      fleetsByID[action.fleet.id] = action.fleet;
      return Object.assign({}, state, { fleetsByID: fleetsByID });

    case "SELECT_ITEM":
      return Object.assign({}, state, {
        selectedItem: action.item
      });

    case "SELECT_DAYS":
      return Object.assign({}, state, {
        startDate: action.startDate,
        endDate: action.endDate
      });

    case "AUTOUPDATE":
      return Object.assign({}, state, {
        autoUpdate: !!action.value
      });

    case "SHOWVERBOSE":
      return Object.assign({}, state, {
        verbose: !!action.value
      });

    case "SHOWLATLONG":
      return Object.assign({}, state, {
        showLatLong: !!action.value
      });

    case "SET_MAP_VEHICLE":
        return Object.assign({}, state, {
          selectedMapVehicleID: action.value
        }); 

    case "SET_HISTORY_ITEM_ID":
        return Object.assign({}, state, {
          selectedHistoryItemID: action.value
        });

    case "ANIMATION_PLAY":
        return Object.assign({}, state, {
          animationPlaying: true,
        });

    case "ANIMATION_STOP":
        return Object.assign({}, state, {
          animationPlaying: false,
        });

    case "ANIMATION_SPEED":
        return Object.assign({}, state, {
          animationSpeed: action.value,
        });

    case "database/connected":
      return {
        ...state,
        databaseConnected: true,
      }

    case "database/disconnected":
      return {
        ...state,
        databaseConnected: false,
      }

    case "socket/connect":
      return {
        ...state,
        realTimeUpdates: true,
      }
  
    case "socket/disconnect":
      return {
        ...state,
        realTimeUpdates: false,
      }
    
    case 'selected/vehicle/history':
      return {
        ...state,
        selectedVehicleHistory: action.payload,
      }
    
    case 'markers/history/changed':
      return {
        ...state,
        historyMarkersById: action.payload,
      }

    case 'markers/fleet/changed':
      return {
        ...state,
        markersByVehicleID: action.payload,
      }

    case 'map/google/changed':
      return {
        ...state,
        map: action.payload,
      }
  
      
    default:
      return state;
  }
};
