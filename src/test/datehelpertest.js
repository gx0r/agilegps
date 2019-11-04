/* Copyright (c) 2016 Grant Miner */
"use strict";
const test = require("tape");
const _ = require("lodash");
const toDate = require("../helper/datehelper").toDate;

test("August date", function(t) {
  t.plan(2); // Tell tape how many assertions we plan to test.
  // This is needed in case some tests are asynchronous, so tape knows when to be done.

  const date = toDate("20150819141220");
  t.ok(_.isDate(date)); // assert that the result is in fact a Date.
  t.equal(date.toUTCString(), "Wed, 19 Aug 2015 14:12:20 GMT");
});

test("January date", function(t) {
  t.plan(2); // Tell tape how many assertions we plan to test.
  // This is needed in case some tests are asynchronous, so tape knows when to be done.

  const date = toDate("20150119141220");
  t.ok(_.isDate(date)); // assert that the result is in fact a Date.
  t.equal(date.toUTCString(), "Mon, 19 Jan 2015 14:12:20 GMT");
});

test("0 month date should throw", function(t) {
  t.plan(1); // Tell tape how many assertions we plan to test.
  // This is needed in case some tests are asynchronous, so tape knows when to be done.
  t.throws(function() {
    toDate("20150019141220");
  }, TypeError);
});

test("December date", function(t) {
  t.plan(2);

  const date = toDate("20151219141220");
  t.ok("Dec Test", _.isDate(date));
  t.equal(date.toUTCString(), "Sat, 19 Dec 2015 14:12:20 GMT");
});

test("Missing last digit date should throw", function(t) {
  t.plan(1);
  t.throws(
    function() {
      toDate("2015081914122"); // missing last digit
    },
    TypeError,
    "Invalid date string"
  );
});

test("a live date", function(t) {
  t.plan(2);

  const date = toDate("20150804183415");
  t.ok("Dec Test", _.isDate(date));
  t.equal(date.toUTCString(), "Tue, 04 Aug 2015 18:34:15 GMT");
});

test("problematic date", function(t) {
  t.plan(2);
  const date = toDate("20150804024111");

  t.ok("Dec Test", _.isDate(date));
  t.equal(date.toUTCString(), "Tue, 04 Aug 2015 02:41:11 GMT");
});
