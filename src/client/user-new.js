/* Copyright (c) 2016 Grant Miner */
"use strict";
const t = require("./i18n").translate;
const m = require("mithril");
const appState = require("./appState");
const Device = require("../common/models/Device");
const catchhandler = require("./catchhandler");
const timezones = require("timezones.json");
const User = require("../common/models/User");
const _ = require("lodash");
const orgselector = require("./orgselector");
const formitem = require("./formitem");
const passwordform = require("./passwordform");
const keyhelper = require("./keyhelper");

module.exports.oninit = function() {
  const state = appState.getState();
  this.user = new User(state.usersByID[state.viewID]);

  if (state.usersByID[state.viewID]) {
    this.editing = true;
  } else {
    this.editing = false;
    this.user = new User();
    this.user.username = state.viewID;
  }

  // appState.getStore().subscribe(function () {
  //     const state = appState.getState();
  //     if (state.usersByID[this.user.username]) {
  //         this.user = state.usersByID[this.user.username];
  //         m.redraw();
  //     }
  // })

  this.save = () => {
    appState
      .saveUser(this.user)
      .then(() => {
        window.history.back();
      })
      .catch(catchhandler);
  };
};

module.exports.view = function() {
  const state = appState.getState();

  return m("div", [
    m(".col-md-3"),
    m(".col-md-6 business-table", [
      m(".btn", this.editing ? t("Edit User") : t("New User")),
      m("form.form-horizontal", [
        Object.keys(this.user).map(key => {
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
                    onclick: ev => {
                      if (ev.target) {
                        this.user[key] = ev.target.checked;
                      }
                    },
                    checked: this.user[key]
                  },
                  timezones.map(tz => {
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
          //         onchange: m.withAttr('value', this.user[key]),
          //         value: this.user[key]()
          //     }, timezones.map(tz => {
          //         return m('option', {
          //             value: tz.value
          //         }, tz.text);
          //     })))])
          // }

          if (key === "password") {
            return passwordform(
              this.user,
              key,
              4,
              8
            );
          } else if (key === "orgid") {
            return orgselector(this.user, 4, 8);
            // } else if (key === 'type') {
            //     return m('div.form-group', [m('label.col-md-2 control-label', key), m('div.col-md-10', m('select.form-control', {
            //         onchange: m.withAttr('value', this.user[key]),
            //         value: this.user[key]()
            //     }, Object.keys(this.types).map(key => {
            //         return m('option', {
            //             value: key
            //         }, this.types[key]);
            //     })))])
          } else {
            return formitem(
              this.user,
              key,
              4,
              8,
              key === "username" && this.editing
            );
            // return m('div.form-group', [m('label.col-md-4 control-label', _.capitalize(key) + ':'), m('div.col-md-8', m('input.form-control', {
            //     onchange: m.withAttr('value', this.user[key]),
            //     disabled: this.editing && key === 'username', // id's can't be edited
            //     value: this.user[key]()
            // }))])
          }
        })
      ]),
      m(".buttons-right", [
        m(
          "button.btn btn-default",
          {
            onclick: ev => {
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
            onclick: this.save
          },
          t("Save")
        )
      ])
    ]),
    m(".col-md-3")
  ]);
};
