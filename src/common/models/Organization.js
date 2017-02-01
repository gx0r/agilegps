/* Copyright (c) 2016 Grant Miner */
'use strict';
let v = require('validator');
let _ = require('lodash');

let Organization = function(data) {
	if (data == null) {
		data = {};
	}

	_.assign(this, data);

	this.id = v.toString(data.id);
	this.name = v.toString(data.name);
	this.ein = v.toString(data.ein);
	this.address1 = v.toString(data.address1);
	this.address2 = v.toString(data.address2);
	this.city = v.toString(data.city);
	this.state = v.toString(data.state);
	this.zip = v.toString(data.zip);
	this.country = v.toString(data.country);
}

module.exports = Organization;
