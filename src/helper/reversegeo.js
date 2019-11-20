/* Copyright (c) 2016 Grant Miner */
"use strict";
const Promise = require("bluebird");
const fetch = require("node-fetch");
const querystring = require("querystring");
const GOOGLE_API_KEY = require("../../config/geocoding").GOOGLE_API_KEY;
const PROVIDER = require("../../config/geocoding").PROVIDER;
const LRU = require("lru-cache");
const VError = require("verror");

const geoCache = new LRU({
  max: 10000,
  maxAge: 1000 * 60 * 60 * 24 * 30 /* in ms */
});
const httpAdapter = "https";

// optional
const extra = {
  apiKey: GOOGLE_API_KEY, // for Mapquest, OpenCage, Google Premier
  formatter: null // 'gpx', 'string', ...
};

const Geocoder = (async function() {
  if (PROVIDER === "local") {
    const geocoder = Promise.promisifyAll(require("local-reverse-geocoder"));
    await geocoder.initAsync({
      load: {
        admin1: true,
        admin2: false,
        admin3And4: false,
        alternateNames: false
      }
    });
    return geocoder;
  } else {
    return require("node-geocoder")(PROVIDER, httpAdapter, extra);
  }
})();

module.exports = async function reverseGeo(lat, lng, timeout, force) {
  const geocoder = await Geocoder;
  if (PROVIDER === "local") {
    const result = (await geocoder.lookUpAsync(
      {
        latitude: lat,
        longitude: lng
      },
      1
    ))[0][0];
    return result;
  }

  if (!force) {
    const hit = geoCache.get(lat + "," + lng);
    if (hit) {
      return Promise.resolve(hit);
    }
  }

  const result = await geocoder.reverse({ lat: lat, lon: lng });
  if (result && result.length) {
    const r = result[0];
    geoCache.set(lat + "," + lng, r);
    return r;
  } else {
    throw new VError("Unexpected reverse geocode", result);
  }
};
