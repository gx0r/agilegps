/* Copyright (c) 2016 Grant Miner */
'use strict';
import {translate as t} from './i18n';
import m from 'mithril';
import appState from './appState';
const _ = require('lodash');
const moment = require('moment');

const withAuth = require('./withAuth');
const eventreportparser = require('../helper/eventreportparser');
const modal = require('mithril-modal');

const catchhandler = require('./catchhandler');

const Cookies = require('cookies-js');
const fullAddress = require('../common/addressdisplay').full;

module.exports.controller = function(args, extras) {
    const ctrl = this;
    ctrl.parsed = m.prop({});

    ctrl.page = function (page) {
        return appState.changePage(page);
    }

    ctrl.pagesize = function (size) {
        return appState.changePageSize(size);
    }

    ctrl.changePage = function (page) {
        return appState.changePage(page);
    }

    ctrl.search = function (search) {
        return appState.changePageSearch(search);
    }

    ctrl.nextPage = function () {
        const page = appState.getState().page;
        return appState.changePage(page + 1);
    }

    function geocode (id, force) {
		const headers = {
			'content-type': 'application/json; charset=UTF-8'
		}
		if (Cookies.get('jwt')) {
			headers['authorization'] = 'Bearer ' + Cookies.get('jwt');
		}

        return fetch('/api/vehiclehistory/' + id + '/geocode' + (force ? '?force=true' : ''), {
            method: 'POST',
            headers
        })
    }

    ctrl.geocode = function (id, force) {
        return geocode(id, force)
        .then(function () {
            appState.updateEvents();
        })
        .catch(catchhandler);
    }

    ctrl.geocodeAll = function () {
        const state = appState.getState();
        const events = state.events;

        Promise.map(events, function (event) {
            if (!event.ad) {
                return geocode(event.id, false);
            }
        }, {concurrency: 1})
        .finally(function () {
            appState.updateEvents();
        })
    }
};

module.exports.view = function(ctrl, args, extras) {

    const state = appState.getState();
    const events = state.events;
    const count = state.eventCount;
    let keys = [];
    const type = _.lowerCase(state.view);
    const page = state.page;
    const pagesize = state.pagesize;

    if (events.length > 0) {
        keys = [];
        events.forEach(function (item) {
            keys = _.union(keys, Object.keys(item));
        })

        if (type === 'events') {
            keys.unshift('Geocode');
        }
    }

    function buildPagination () {
        const pages = Math.ceil(count / pagesize);
        const lis = [];
        for (let i = 1; i < pages + 1; i++) {
            lis.push(m('li', m('a', {
                style: {
                    "cursor": "pointer"
                },
                onclick: m.withAttr('value', ctrl.changePage),
                value: i
            }, i)))
        }
        lis.push(m('li',
            m('a', {
                style: {
                    "cursor": "pointer"
                },
                onclick: ctrl.nextPage,
            }, '»')
        ))
        return m('nav', m('ul.pagination', lis));
    }

    return m('div.text-nowrap', [
        m('label', t('Selected Page'), m('input.form-control', {
            type: 'number',
            onchange: m.withAttr('value', ctrl.page),
            value: page
        })),

        m('label', t('Count per Page'), m('input.form-control', {
            type: 'number',
            onblur: m.withAttr('value', ctrl.pagesize),
            value: pagesize
        })),

        type === 'rawevents' ? m('label', t('Search by IMEI'), m('input.form-control', {
            type: 'text',
            onchange: m.withAttr('value', ctrl.search),
            value: state.search,
            onkeyup: function(ev) {
                if (ev.keyCode === 13) {
                    appState.updateEvents();
                } else {
                    m.redraw.strategy('none');
                }
            },
        })) : null,

        m('button.btn btn-success', {
            onclick: function () {
                appState.updateEvents();
            }
        }, t('Refresh')),

        buildPagination(),

        type === 'events' ? m('div', 'Legend: a = azimuth, b = buffered, bp = battery percentage, d = date sent by the unit, faketow = maybe about to be towing, g = gps accuracy (1=most accurate/20=least/0=unknown or not reported), '
    + 'gss = gpsSignalStatus report (1 seeing, 0 not seeing), satelliteNumber = number of GPS satellites seeing, h = engine hours, ig = ignition, igd = ignition duration, m = distance (kilometers), mo = motion, p = powervcc, rid = report id, rty = report type, s = speed (kph)') : null,

        type === 'events' ? m('button.btn-xs', {
            onclick: function (ev) {
                ctrl.geocodeAll();
            }
        }, t('Cached geocode visible with missing')) : null,
        m('br'),
        // m('nav', m('ul.pagination', [
        //     m('li', m('a', {
        //         onclick: m.withAttr('value', ctrl.changePage),
        //         value: '1'
        //     }, '1')),
        // ])),
        m('div', count + ' ' + type),

        m.component(modal, {
            animation: 'fadeAndScale',
            style: {
                dialog: {
                    // backgroundColor: '#aaffee',
                    width: '600px'
                }
            },
            close: '✘'
        }, m.component({
            view: function () {
                return m('div', m('pre', _.isObject(ctrl.parsed()) ? JSON.stringify(ctrl.parsed(), null, 4) : ctrl.parsed()));
            }
        })),

        m('table.table-condensed table-bordered table-striped', [
            m('thead', keys.map(function (key) {
                return m('td', key)
            })),
            type === 'rawevents' || type ==='events' ? m('tbody', events.map(function (event) {
                return m('tr', [keys.map(function (key) {
                    if (key === 'message') {
                        const msg = event[key];

                        return m('td', m('button.btn btn-xs btn-default', {
                            onclick: function () {
                                modal.show();
                                let parsed;
                                try {
                                    parsed = eventreportparser(msg);
                                    delete parsed.args;
                                    ctrl.parsed(parsed);
                                } catch (e) {
                                    parsed = e;
                                    if (e.stack) {
                                        ctrl.parsed(e.stack);
                                    } else {
                                        ctrl.parsed(e.message);
                                    }

                                }
                                // alert(JSON.stringify(parsed, null, 4));
                            }
                        }, t('Parse')), ' '+ msg)
                    }
                    if (key === 'ad') {
                        if (event[key]) {
                            let obj = event[key];
                            let str = JSON.stringify(obj, null, 2);
                            return m('pre.pointer', {
                                onclick: function (ev) {
                                    ev.target.innerHTML = str;
                                }
                            }, fullAddress(event) + '…')
                        }
                    }
                    if (key === 'd' || key === 'date') {
                        try {
                            return m('td', moment(event[key]).format('M/DD/YYYY h:mm:ss A'));
                        } catch (e) {
                            console.warn(e);
                            return m('td', event[key]);
                        }
                    } else if (key === 'Geocode') {
                        return [
                            m('button.button btn-xs', {
                            onclick: function (ev) {
                                ctrl.geocode(event.id, false);
                            }
                        }, t('Cached')),
                        ' ',
                        m('button.button btn-xs', {
                            onclick: function (ev) {
                                ctrl.geocode(event.id, true);
                            }
                        }, t('Force'))
                        ]
                    } else {
                        return m('td', event[key]);
                    }
                }),
            ])})) : null,

            type === 'exceptions' ? m('tbody', events.map(function (event) {
                return m('tr', keys.map(function (key) {
                    if (key === 'date') {
                        try {
                            return m('td', moment(event[key]).format('M/DD/YYYY h:mm:ss.SSS A'));
                        } catch (e) {
                            console.warn(e);
                            return m('td', event[key]);
                        }
                    } else {
                        return m('td', m('pre', key !== 'stack' && _.isObject(event[key]) ? JSON.stringify(event[key], null, 4) : event[key]))
                    }
                }))
            })) : null,
        ])
    ])
};
