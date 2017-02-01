/* Copyright (c) 2016 Grant Miner */

'use strict';
// Dangerous !!!
// Drops and recreates the vehicles/vehiclehistory tables for development.

const Promise = require('bluebird');
const r = require('../common/db');
const os = require('os');

function ignore(e) {
	console.error(e);
	return undefined;
}

const hostname = os.hostname();

let inquirer = require("inquirer");
inquirer.prompt([{
		type: "expand",
		message: "You sure you want to drop the vehicle and vehiclehistory tables?? On " + hostname + "?",
		name: "deleteTables",
		choices: [{
				key: "n",
				name: "No",
				value: "no"
			}, {
				key: "y",
				name: "Yes",
				value: "yes"
			},
			new inquirer.Separator(), {
				key: "x",
				name: "Abort",
				value: "abort"
			}
		]
	}],
	function(answers) {
		if (answers.deleteTables === 'yes') {
			Promise.coroutine(function*() {
				yield Promise.join(r.tableDrop('vehicles').catch(ignore), r.tableDrop('devices').catch(ignore), r.tableDrop('vehiclehistory').catch(ignore), r.tableDrop('rawevents').catch(ignore));
				console.log('Done. Run Schema next.	');
				r.getPoolMaster().drain(); // drain connection pool to allow process to exit.
			})();
		} else {
			r.getPoolMaster().drain(); // drain connection pool to allow process to exit.
		}
	}
);
