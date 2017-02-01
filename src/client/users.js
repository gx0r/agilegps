/* Copyright (c) 2016 Grant Miner */
'use strict';
import {translate as t} from './i18n';
import m from 'mithril';
import appState from './appState';
const sorts = require('./sorts');
const catchhandler = require('./catchhandler');
const _ = require('lodash');

module.exports.controller = function(args, extras) {
	const ctrl = this;

	ctrl.delete = function (user) {
		let result = window.confirm('Are you sure you want to delete ' + user.username + '?');

		if (result === true) {
			appState.deleteUser(user)
			.catch(catchhandler);
		}
	}
};

function getSecurtyLevel(user) {
	if (user.isAdmin && user.isOrgAdmin) {
		return t('Site Admin and Organization Admin');
	}
	if (user.isAdmin)
		return t('Site Admin');
	if (user.isOrgAdmin)
		return t('Organization Admin');
	return t('User');
}

module.exports.view = function(ctrl, args, extras) {
	const state = appState.getState();
	const subview = state.subview;
	const orgid = state.selectedOrg.id;

	let users = _.toArray(state.usersByID);

	if (state.subview != 'ALL') {
		users = users.filter(function (user) {
			return user.orgid === orgid;
		})
	}

	return m('.div', [
		m('.col-md-2'),
		m('.col-md-8 business-table', [
			m('button.btn btn-default', {
				style: {
					'margin-bottom': '1em'
				},
				onclick: function () {
					appState.viewNewUser();
				}
			}, t('New User')),
			m('table.table table-bordered table-striped', sorts(users), [
				m('thead',
					m('tr', [
						m('th[data-sort-by=username]', t('Username')),
						m('th[data-sort-by=email]', t('Email')),
						m('th[data-sort-by=firstname]', t('First Name')),
						m('th[data-sort-by=lastname]', t('Last Name')),
						m('th[data-sort-by=isOrgAdmin]', t('Security Level')),
						ctrl.orgid ? '' : m('th', t('Organization')),
						m('th', t('Operations'))
					])
				),
				m('tbody', [
					users.map(function(user) {
						return m('tr', [
							m('td', user.username),
							m('td', user.email),
							m('td', user.firstname),
							m('td', user.lastname),
							m('td', getSecurtyLevel(user)),
							ctrl.orgid ? '' : m('td', appState.getOrgName(user.orgid)),
							m('td', [
								m('a.btn btn-primary btn-sm  ', {
									onclick: function (ev) {
										ev.preventDefault();
										appState.viewUserByID(user.username);
									}
								}, m('span.middle glyphicon glyphicon-pencil'), ' ' + t('Update')),
								' ',
								m('a.btn btn-primary btn-sm ', {
									onclick: function(ev) {
										ev.preventDefault()
										ctrl.delete(user);
									}
								}, m('span.middle glyphicon glyphicon-trash'), ' ' + t('Delete'))
							])
						])
					})
				])
			])
		]),
		m('.col-md-2')
	])
};
