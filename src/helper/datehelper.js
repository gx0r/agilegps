/* Copyright (c) 2016 Grant Miner */
"use strict";
const regex = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/;
/*
Takes a date string like: '20150819141220'
and converts it to a Date object.

Do something like:
date.toUTCString()
to get as UTC.
*/
module.exports.toDate = function(dateString) {
  const matches = regex.exec(dateString);

  if (matches === null) {
    throw new TypeError(
      "'" + dateString + "'" + " does not look like a valid date."
    );
  }

  if (matches[2] === "00") {
    // month must be 1 or greater
    throw new TypeError(
      "Invalid date string; month must not be 00. Passed string was: " +
        dateString
    );
  }

  return new Date(
    Date.UTC(
      matches[1],
      matches[2] - 1,
      matches[3],
      matches[4],
      matches[5],
      matches[6]
    )
  );
};
