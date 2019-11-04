/* Copyright (c) 2016 Grant Miner */
"use strict";
const Status = require("../common/status");
const todir = require("../common/todir");

function getProp(name, obj) {
  if (name === "Status.getStatus(last)") {
    return Status.getStatus(obj.last);
  }

  if (name === "azimuth(last)") {
    return todir(obj.last);
  }

  let prop = name.split(".");
  let i = 0;
  while (i < prop.length) {
    if (obj != null) {
      obj = obj[prop[i]];
    }
    i++;
  }
  return obj;
}

function sorts(list) {
  return {
    onclick: function(e) {
      let prop = e.target.getAttribute("data-sort-by");

      if (prop) {
        let first = list[0];
        list.sort(function(a, b) {
          // let x = a[prop];
          // let y = b[prop];
          let x = getProp(prop, a);
          let y = getProp(prop, b);
          if (x == null) x = "";
          if (y == null) y = "";

          return x > y ? 1 : x < y ? -1 : 0;
        });
        if (first === list[0]) list.reverse();
      }
    }
  };
}
module.exports = sorts;
