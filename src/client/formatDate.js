"use strict";
const isUserMetric = require("./isUserMetric");
const moment = require("moment");

function formatDate(item) {
  try {
    if (isUserMetric()) {
      return moment(item).format("YYYY-MM-DD HH:mm:ss");
    } else {
      return moment(item).format("M/DD/YYYY h:mm:ss A");
    }
  } catch (err) {
    console.warn(err);
    return item;
  }
}

module.exports = formatDate;
