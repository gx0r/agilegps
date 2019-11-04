/* Copyright (c) 2016 Grant Miner */
"use strict";
import { translate as t } from "./i18n";
import m from "mithril";
import appState from "./appState";
const Device = require("../common/models/Device");
const catchhandler = require("./catchhandler");
const timezones = require("timezones.json");
const User = require("../common/models/User");
const _ = require("lodash");
const orgselector = require("./orgselector");
const formitem = require("./formitem");
const keyhelper = require("./keyhelper");

module.exports.controller = function(args, extras) {
  const ctrl = this;
  const state = appState.getState();
  ctrl.user = new User(state.usersByID[state.viewID]);

  if (state.usersByID[state.viewID]) {
    ctrl.editing = true;
  } else {
    ctrl.editing = false;
    ctrl.user = new User();
    ctrl.user.username = state.viewID;
  }

  // appState.getStore().subscribe(function () {
  //     const state = appState.getState();
  //     if (state.usersByID[ctrl.user.username]) {
  //         ctrl.user = state.usersByID[ctrl.user.username];
  //         m.redraw();
  //     }
  // })

  ctrl.save = function() {
    appState
      .saveUser(ctrl.user)
      .then(function() {
        window.history.back();
      })
      .catch(catchhandler);
  };
};

module.exports.view = function(ctrl, args, extras) {
  const state = appState.getState();

  return m("div", [
    m(".col-md-3"),
    m(".col-md-6 business-table", [
      m(".btn", ctrl.editing ? t("Edit User") : t("New User")),
      m("form.form-horizontal", [
        Object.keys(ctrl.user).map(function(key) {
          if (!state.user.isAdmin && key === "isAdmin") {
            // only let site admins create site admins
            return;
          }

          if (key === "isAdmin" || key === "isOrgAdmin") {
            return m("div.form-group", [
              m("label.col-md-4 control-label", keyhelper(key) + ":"),
              m(
                "div.col-md-8",
                m(
                  "input[type=checkbox]",
                  {
                    onclick: function() {
                      ctrl.user[key] = this.checked;
                    },
                    checked: ctrl.user[key]
                  },
                  timezones.map(function(tz) {
                    return m(
                      "option",
                      {
                        value: tz.value
                      },
                      tz.text
                    );
                  })
                )
              )
            ]);
          }

          // if (key === 'timezone') {
          //     return m('div.form-group', [m('label.col-md-2 control-label', key), m('div.col-md-10', m('select.form-control', {
          //         onchange: m.withAttr('value', ctrl.user[key]),
          //         value: ctrl.user[key]()
          //     }, timezones.map(function (tz) {
          //         return m('option', {
          //             value: tz.value
          //         }, tz.text);
          //     })))])
          // }

          if (key === "orgid") {
            return orgselector(ctrl.user, 4, 8);
            // } else if (key === 'type') {
            //     return m('div.form-group', [m('label.col-md-2 control-label', key), m('div.col-md-10', m('select.form-control', {
            //         onchange: m.withAttr('value', ctrl.user[key]),
            //         value: ctrl.user[key]()
            //     }, Object.keys(ctrl.types).map(function (key) {
            //         return m('option', {
            //             value: key
            //         }, ctrl.types[key]);
            //     })))])
          } else {
            return formitem(
              ctrl.user,
              key,
              4,
              8,
              key === "username" && ctrl.editing
            );
            // return m('div.form-group', [m('label.col-md-4 control-label', _.capitalize(key) + ':'), m('div.col-md-8', m('input.form-control', {
            //     onchange: m.withAttr('value', ctrl.user[key]),
            //     disabled: ctrl.editing && key === 'username', // id's can't be edited
            //     value: ctrl.user[key]()
            // }))])
          }
        })
      ]),
      m(".buttons-right", [
        m(
          "button.btn btn-default",
          {
            onclick: function(ev) {
              ev.preventDefault();
              window.history.back();
            }
          },
          t("Cancel")
        ),
        " ",
        m(
          "button.btn btn-success",
          {
            onclick: ctrl.save
          },
          t("Save")
        )
      ])
    ]),
    m(".col-md-3")
  ]);
};
