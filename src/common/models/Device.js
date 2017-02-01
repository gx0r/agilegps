/* Copyright (c) 2016 Grant Miner */
'use strict';
let v = require('validator');
let _ = require('lodash');

let Device = function (data) {
    if (data == null) {
        data = {};
    }

    _.assign(this, data);

    this.imei = v.toString(data.imei);
    this.sim = v.toString(data.sim);
    this.phone = v.toString(data.phone);
    this.network = v.toString(data.network);
    this.activationDate = v.toDate(data.activationDate);
    this.active = v.toBoolean(data.active);
    this.status = v.toString(data.status);
    this.orgid = v.toString(data.orgid);
}

module.exports = Device;
