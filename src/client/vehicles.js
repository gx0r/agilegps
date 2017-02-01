/* Copyright (c) 2016 Grant Miner */
'use strict';
const m = require('mithril');
const sorts = require('./sorts');
const catchhandler = require('./catchhandler');
const appState = require('./appState');

module.exports.controller = function(args, extras) {
	const ctrl = this;

	ctrl.delete = function (vehicle) {
		let result = window.confirm('Are you sure you want to delete vehicle ' + vehicle.name + '?');

		if (result === true) {
			appState.deleteVehicle(vehicle)
			.catch(catchhandler);
		}
	}
};

module.exports.view = function(ctrl, args, extras) {
	const state = appState.getState();

	return m('div', [
		m('.col-sm-1'),
		m('.business-table.col-sm-10', [
			m('button.btn btn-default', {
				style: {
					'margin-bottom': '1em'
				},
				onclick: function (ev) {
					ev.preventDefault();
					appState.viewNewVehicle();
				}
			}, 'New Vehicle'),
			m('table.table table-bordered table-striped', sorts(state.vehiclesByID), [
				m('thead',
					m('tr', [
						m('th[data-sort-by=name]', 'Name'),
						m('th[data-sort-by=device]', 'Device IMEI'),
						m('th[data-sort-by=plate]', 'Plate'),
						m('th[data-sort-by=vin]', 'VIN'),
						m('th', '')
					])
				),
				m('tbody', [
					_.toArray(state.vehiclesByID).map(function(vehicle) {
						return m('tr', [
							m('td', vehicle.name),
							m('td', m('a', {
								onclick: function (ev) {
									ev.preventDefault();
									appState.viewDeviceByID(vehicle.device);
								},
							}, vehicle.device)),
							m('td', vehicle.plate),
							m('td', vehicle.vin),
							m('td', [
								m('a.btn btn-sm btn-primary btn-warning', {
									onclick: function (ev) {
										ev.preventDefault();
										appState.viewVehicleByID(vehicle.id);
									},
								}, m('span.middle glyphicon glyphicon-pencil'), ' Update'),
								' ',
								m('a.btn btn-primary btn-sm btn-danger', {
									onclick: function (ev) {
										ev.preventDefault();
										ctrl.delete(vehicle);
									},
								}, m('span.middle glyphicon glyphicon-trash'), ' Delete')
							])
						])
					})
				])
			])
		]),
		m('.col-sm-1')
	])
};
