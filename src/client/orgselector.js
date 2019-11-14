/* Copyright (c) 2016 Grant Miner */
"use strict";
const m = require("mithril");
const key = "orgid";
const _ = require("lodash");

const appState = require("./appState");

module.exports = function(obj, col1, col2) {
  const state = appState.getState();

  if (!obj.orgid) {
    obj.orgid = state.selectedOrg.id;
  }

  col1 = col1 || 2;
  col2 = col2 || 10;

  if (state.user.isAdmin) {
    return m("div.form-group", [
      m("label.col-md-" + col1 + " control-label", "Organization:"),
      m(
        "div.col-md-" + col2,
        m(
          "select.form-control",
          {
            onchange: ev => {
              obj[key] = ev.target.value;
            },
            value: obj[key] || state.selectedOrg.id
          },
          _.union([{ id: " " }], _.toArray(state.orgsByID)).map(org => {
            return m(
              "option",
              {
                value: org.id
              },
              org.name
            );
          })
        )
      )
    ]);
  }
};
