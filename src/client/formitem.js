/* Copyright (c) 2016 Grant Miner */
'use strict';
import {translate as t} from './i18n';
import m from 'mithril';
const _ = require('lodash');
const keyhelper = require('./keyhelper');

module.exports = function(obj, key, col1, col2, disabled) {
	col1 = col1 || 2;
	col2 = col2 || 10;

	return m('div.form-group', m('label.col-md-' + col1 + ' control-label', t(keyhelper(key)) + ':'), m('div.col-md-' + col2, (obj[key] === true || obj[key] === false) ? m('input[type=checkbox]', {
			disabled: disabled,
			onclick: function() {
				obj[key] = this.checked;
			},
			checked: obj[key] === true
		}) :
		m('input.form-control', {
			onchange: function (ev) {
				obj[key] = ev.target.value;
			},
			disabled: disabled,
			value: obj[key]
		})))
}
