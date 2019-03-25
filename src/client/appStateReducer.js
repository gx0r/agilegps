/* Copyright (c) 2016 Grant Miner */
'use strict';
// Reducer for Redux
const Cookies = require('cookies-js');
const helpers = require('../common/helpers');
let defaultState = require('./appDefaultState');

if (history.state) {
    defaultState = Object.freeze(Object.assign({}, defaultState, history.state));
}

module.exports = function reducer (state, action) {
    if (!state) {
        return defaultState;
    }

	var newState = {};

    switch(action.type) {
        case 'SOCKET_CONNECT':
            return Object.assign({}, state, { realTimeUpdates : true });

        case 'SOCKET_DISCONNECT':
            return Object.assign({}, state, { realTimeUpdates : false });

        case 'LOGOUT':
            return Object.assign({}, defaultState );

        case 'SESSION':
            return Object.assign({}, state, { user : action.user });

        case 'GET_ORG':
            var orgsByID = _.cloneDeep(state.orgsByID);
            orgsByID[action.org.id] = action.org;
            return Object.assign({}, state, { orgsByID : orgsByID });

        case 'SELECT_ORG':
            return Object.assign({}, state, {
                 selectedOrg : action.org ,
                 selectedItem: null,
                 vehiclesByID: {},
                 selectedVehicleHistory: []
             });

        case 'SELECT_FLEET':
            newState = {};
            newState.impliedSelectedVehicles = [];
            newState.selectedFleets = [action.fleet];
            newState.selectedAllFleets = false;
            newState.selectedVehicle = null;

            newState.selectedFleets.forEach(function (fleet) {
                fleet.vehicles.forEach(function (vid) {
                    if (state.vehiclesByID[vid] != null) {
                        newState.impliedSelectedVehicles.push(state.vehiclesByID[vid]);
                    }
                })
            })

            newState.impliedSelectedVehicles = _.uniq(newState.impliedSelectedVehicles);
            return Object.assign({}, state, newState);

        case 'SELECT_FLEET_ALL':
            newState = {};
            newState.selectedFleets = _.cloneDeep(_.toArray(state.fleetsByID));
            newState.impliedSelectedVehicles = [];
            newState.selectedAllFleets = true;
            newState.selectedVehicle = null;
            newState.selectedFleets.forEach(function (fleet) {
                fleet.vehicles.forEach(function (vid) {
                    if (state.vehiclesByID[vid] != null) {
                        newState.impliedSelectedVehicles.push(state.vehiclesByID[vid]);
                    }
                })
            })
            newState.impliedSelectedVehicles = _.uniq(newState.impliedSelectedVehicles);
            return Object.assign({}, state, newState);

        case 'SELECT_VEHICLE':
            return Object.assign({}, state, {
                selectedVehicle: state.vehiclesByID[action.id],
                impliedSelectedVehicles: [state.vehiclesByID[action.id]],
                view: 'ORG',
                selectedAllFleets: false,
                selectedFleets: [],
                selectedVehicleHistory: []
            });

        case 'USERS':
            var usersByID = {};
            action.users.forEach(function (user) {
                usersByID[user.username] = user;
            });
            return Object.assign({}, state, { usersByID: usersByID });

        case 'VEHICLES':
            var vehiclesByID = {};
            action.vehicles.forEach(function (vehicle) {
                vehiclesByID[vehicle.id] = vehicle;
            });
            return Object.assign({}, state, {
                vehicles : action.vehicles,
                vehiclesByID: vehiclesByID,
                lastUpdated: new Date()
            });

        case 'ORG_USERS':
            var usersByID = _.cloneDeep(state.usersByID);
            action.users.forEach(function (user) {
                usersByID[user.username] = user;
            });
            return Object.assign({}, state, { usersByID : usersByID });

        case 'ORGS':
            var orgs = action.orgs;
            var orgsByID = {};
            orgs.forEach(function (org) {
                orgsByID[org.id] = org;
            });
            return Object.assign({}, state, { orgsByID : orgsByID });

        case 'SAVE_ORG':
            var orgsByID = _.cloneDeep(state.orgsByID);
            orgsByID[action.org.id] = action.org;
            return Object.assign({}, state, { orgsByID : orgsByID });

        case 'SAVE_USER':
            var usersByID = _.cloneDeep(state.usersByID);
            usersByID[action.user.username] = action.user;
            var me = state.user;
            if (action.user.username === me.username) {
                me = action.user;
            }
            return Object.assign({}, state, {
                usersByID : usersByID,
                user: me
            });

        case 'SAVE_VEHICLE':
            var vehiclesByID = _.cloneDeep(state.vehiclesByID);
            vehiclesByID[action.vehicle.id] = action.vehicle;

            var impliedSelectedVehicles = _.cloneDeep(state.impliedSelectedVehicles);

            for (let i = 0; i < impliedSelectedVehicles.length; i++) {
                if (impliedSelectedVehicles[i].id == action.vehicle.id) {
                    impliedSelectedVehicles[i] = action.vehicle;
                    break;
                }
            }

            return Object.assign({}, state, {
                vehiclesByID : vehiclesByID,
                impliedSelectedVehicles: impliedSelectedVehicles
            });

        case 'DELETE_VEHICLE':
            var vehiclesByID = _.cloneDeep(state.vehiclesByID);
            delete vehiclesByID[action.vehicle.id];

            var impliedSelectedVehicles = _.cloneDeep(state.impliedSelectedVehicles);

            for (let i = 0; i < impliedSelectedVehicles.length; i++) {
                if (impliedSelectedVehicles[i].id == action.vehicle.id) {
                    delete impliedSelectedVehicles[i];
                    break;
                }
            }

            return Object.assign({}, state, {
                vehiclesByID : vehiclesByID,
                impliedSelectedVehicles: impliedSelectedVehicles
            });

        case 'DELETE_USER':
            var usersByID = _.cloneDeep(state.usersByID);
            delete usersByID[action.user.username];
            return Object.assign({}, state, { usersByID : usersByID });

        case 'DELETE_ORG':
            var orgsByID = _.cloneDeep(state.orgsByID);
            delete orgsByID[action.org.id];
            return Object.assign({}, state, { orgsByID : orgsByID });

        case 'SAVE_DEVICE':
            var devicesByID = _.cloneDeep(state.devicesByID);
            devicesByID[action.device.imei] = action.device;
            return Object.assign({}, state, { devicesByID : devicesByID });

        case 'DELETE_DEVICE':
            var devicesByID = _.cloneDeep(state.devicesByID);
            delete devicesByID[action.device.imei];
            return Object.assign({}, state, { devicesByID : devicesByID });

        case 'DEVICES':
            var devices = action.devices;
            var devicesByID = {};
            devices.forEach(function (device) {
                devicesByID[device.imei] = device;
            });
            return Object.assign({}, state, { devicesByID : devicesByID });

        case 'FLEETS':
            var fleets = action.fleets;
            var fleetsByID = {};
            fleets.forEach(function (fleet) {
                fleetsByID[fleet.id] = fleet;
            });
            return Object.assign({}, state, { fleetsByID : fleetsByID });

        case 'DELETE_FLEET':
            var fleetsByID = _.cloneDeep(state.fleetsByID)
            delete fleetsByID[action.fleet.id];
            return Object.assign({}, state, { fleetsByID : fleetsByID });

        case 'SAVE_FLEET':
            var fleetsByID = _.cloneDeep(state.fleetsByID)
            fleetsByID[action.fleet.id] = action.fleet;
            return Object.assign({}, state, { fleetsByID : fleetsByID });

        case 'VIEW':
            var isAllSiteLevel = action.subview === 'ALL' && (action.view === 'ORG' || action.view === 'USER' || action.view === 'DEVICE');
            var isAllOrgs = action.view === 'ORG' && action.subview === 'ALL';

            return Object.assign({}, state, {
                view: action.view,
                subview: action.subview,
                viewID: action.viewID,
                selectedOrg: isAllSiteLevel ? {} : state.selectedOrg,
                selectedAllFleets: isAllOrgs ? false : state.selectedAllFleets,
                selectedFleets: isAllOrgs ? [] : state.selectedFleets,
                selectedItem: isAllOrgs ? null : state.selectedItem,
                selectedVehicle: isAllOrgs ? null : state.selectedVehicle,
                selectedVehicles: isAllOrgs ? null : state.selectedVehicles,
                impliedSelectedVehicles: isAllOrgs ? [] : state.impliedSelectedVehicles,
                selectedVehicleHistory: isAllOrgs ? [] : state.selectedVehicleHistory,
                vehiclesByID: isAllOrgs? {} : state.vehiclesByID
            });

        case 'VIEW_SPLIT_SCREEN':
            return Object.assign({}, state, {
                view: 'ORG',
                subview: 'SPLIT'
            });

        case 'VIEW_MAP':
            return Object.assign({}, state, {
                view: 'ORG',
                subview: 'MAP'
            });

        case 'VIEW_REPORTS':
            return Object.assign({}, state, {
                view: 'ORG',
                subview: 'REPORT'
            });

        case 'SELECT_ITEM':
            return Object.assign({}, state, {
                selectedItem: action.item
            });

        case 'SELECT_DAYS':
            return Object.assign({}, state, {
                startDate: action.startDate,
                endDate: action.endDate
            });

        case 'VEHICLE_HISTORY':
            // var vehicleHistoryByID = _.cloneDeep(state.vehicleHistoryByID);
            // vehicleHistoryByID[action.vehicle.id] = action.history;
            // return Object.assign({}, state, {
            //     vehicleHistoryByID: vehicleHistoryByID
            // });
            return Object.assign({}, state, {
                selectedVehicleHistory: action.history,
                lastUpdated: new Date(),
            });

        case 'CHANGED_VEHICLE_HISTORY':
            var vehiclesByID = _.cloneDeep(state.vehiclesByID);
            vehiclesByID[action.event.id] = action.event;
            let newState = Object.assign({}, state, {
                vehiclesByID: vehiclesByID,
                lastUpdated: new Date(),
            });
			newState.impliedSelectedVehicles = [];

			for (let vehicle of state.impliedSelectedVehicles) {
				newState.impliedSelectedVehicles.push(vehiclesByID[vehicle.id]);
			}

			return newState;

        case 'EVENTS':
            return Object.assign({}, state, {
                events: action.events
            });

        case 'CHANGE_EVENTS_PAGE':
            return Object.assign({}, state, {
                page: action.page
            });

        case 'CHANGE_EVENTS_PAGE_SIZE':
            return Object.assign({}, state, {
                pagesize: action.size
            });

        case 'CHANGE_EVENTS_PAGE_SEARCH':
            return Object.assign({}, state, {
                search: action.search
            });

        case 'EVENT_COUNT':
            return Object.assign({}, state, {
                eventCount: action.count
            });

        case 'AUTOUPDATE':
            return Object.assign({}, state, {
                autoUpdate: !!action.value
            });

        case 'SHOWVERBOSE':
            return Object.assign({}, state, {
                verbose: !!action.value
            });

        case 'SHOWLATLONG':
            return Object.assign({}, state, {
                showLatLong: !!action.value
            });

        default:
            return state;
    }
}
