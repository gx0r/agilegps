/* Copyright (c) 2016 Grant Miner */
'use strict';
const test = require('tape');
const reversegeo = require('../helper/reversegeo');
const Promise = require('bluebird');

test('reverse geocode', function(t) {
	t.plan(3);

	reversegeo(48.667374, 37.538473)
		.then(function(result) {
			console.log(JSON.stringify(result, null, 4));

			//
			// {
			// 	"administrativeLevels": {
			// 		"level1long": "Donetsk Oblast",
			// 		"level1short": "Donetsk Oblast"
			// 	},
			// 	"country": "Ukraine",
			// 	"countryCode": "UA",
			// 	"extra": {
			// 		"confidence": 0.7,
			// 		"establishment": null,
			// 		"googlePlaceId": "ChIJ15Y2isa930ARblaFX3jDffM",
			// 		"neighborhood": null,
			// 		"premise": null,
			// 		"subpremise": null
			// 	},
			// 	"formattedAddress": "H20, Donetsk Oblast, Ukraine",
			// 	"latitude": 48.6674589,
			// 	"longitude": 37.538869,
			// 	"streetName": "H20"
			// }

			t.equal(result.formattedAddress, 'H20, Donetsk Oblast, Ukraine');
			t.equal(result.streetName, 'H20');
			t.equal(result.country, 'Ukraine');

		})
})
