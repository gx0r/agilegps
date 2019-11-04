/* Copyright (c) 2016 Grant Miner */
"use strict";
const test = require("tape");
const _ = require("lodash");
const summary = require("../../server/lib/reports/summary");

test("summary report", function(t) {
  t.plan(3);

  const history = require("./apr3.json");
  const totals = Object.create(null);
  const result = summary(history, totals);
  t.equal(result.parks, 4, "4 parks");
  t.equal(result.totalPark, 36279, "36279 total park");
  t.equal(result.totalTransit, 1092, "1092 total transit");
});
