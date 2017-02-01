/* Copyright (c) 2016 Grant Miner */
'use strict';
let v = require('validator');
let _ = require('lodash');

let User = function (data) {
    if (data == null) {
        data = {};
    }

	_.assign(this, data);

    this.username = v.toString(data.username);
    this.password = v.toString(data.password);
    this.email = v.toString(data.email);
    this.firstname = v.toString(data.firstname);
    this.lastname = v.toString(data.lastname);
    this.workphone = v.toString(data.workphone);
    this.mobilephone = v.toString(data.mobilephone);
    this.fax = v.toString(data.fax);
    this.isAdmin = v.toBoolean(data.isAdmin);
    this.isOrgAdmin = v.toBoolean(data.isOrgAdmin);
    this.orgid = data.orgid;
    this.advancedMode = v.toBoolean(data.advancedMode);
    this.metric = v.toBoolean(data.metric);
}

module.exports = User;
