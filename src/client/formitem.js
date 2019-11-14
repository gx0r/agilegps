/* Copyright (c) 2016 Grant Miner */
"use strict";
const t = require("./i18n").translate;
const m = require("mithril");
const keyhelper = require("./keyhelper");

module.exports = function(obj, key, col1, col2, disabled) {
  col1 = col1 || 2;
  col2 = col2 || 10;

  return m(
    "div.form-group",
    m("label.col-md-" + col1 + " control-label", t(keyhelper(key)) + ":"),
    m(
      "div.col-md-" + col2,
      obj[key] === true || obj[key] === false
        ? m("input[type=checkbox]", {
            disabled: disabled,
            onclick: ev => {
              obj[key] = ev.target.checked;
            },
            checked: obj[key] === true
          })
        : m("input.form-control", {
            onchange: ev => {
              if (ev.target) {
                obj[key] = ev.target.value;
              }              
            },
            disabled: disabled,
            value: obj[key]
          })
    )
  );
};
