/* Copyright (c) 2016 Grant Miner */
"use strict";
const t = require("./i18n").translate;
const m = require("mithril");
const appState = require("./appState");
const Device = require("../common/models/Device");
const catchhandler = require("./catchhandler");
const Organization = require("../common/models/Organization");
const _ = require("lodash");
const keyhelper = require("./keyhelper");

module.exports.controller = function(args, extras) {
  const ctrl = this;
  const state = appState.getState();
  ctrl.org = new Organization(state.orgsByID[state.viewID]);

  if (state.orgsByID[state.viewID]) {
    ctrl.editing = true;
  } else {
    ctrl.editing = false;
    ctrl.org = new Organization();
    ctrl.org.id = state.viewID;
  }

  // appState.getStore().subscribe(function () {
  // 	const state = appState.getState();
  // 	if (state.orgsByID[ctrl.org.id]) {
  // 		ctrl.org = state.orgsByID[ctrl.org.id];
  // 		m.redraw();
  // 	}
  // })
};

module.exports.view = function(ctrl) {
  const org = ctrl.org;
  const editing = ctrl.editing;

  return m("div", [
    m(".col-sm-3"),
    m(".business-table col-sm-6 ", [
      m(
        ".btn.center",
        editing ? t("Edit Organization") : t("Create Organization")
      ),
      m("form.form-horizontal", [
        Object.keys(org).map(function(key) {
          return m("div.form-group", [
            m("label.col-md-2 control-label", t(keyhelper(key)) + ":"),
            m(
              "div.col-md-10",
              m("input.form-control", {
                onchange: function(ev) {
                  org[key] = ev.target.value;
                },
                disabled: key === "id",
                value: org[key]
              })
            )
          ]);
        })
        // m('div.form-group', [m('label.col-md-2 control-label', 'Name'), m('div.col-md-10 ', m('input.form-control', {
        //     onchange: m.withAttr('value', ctrl.organization.name),
        //     value: ctrl.organization.name()
        // }))]),
        // m('div.form-group', [m('label.col-md-2 control-label', 'EIN'), m('div.col-md-10 ', m('input.form-control', {
        //     onchange: m.withAttr('value', ctrl.organization.ein),
        //     value: ctrl.organization.ein()
        // }))]),
        // m('div.form-group', [m('label.col-md-2 control-label', 'Address Line 1'), m('div.col-md-10 ', m('input.form-control', {
        //     onchange: m.withAttr('value', ctrl.organization.address1),
        //     value: ctrl.organization.address1()
        // }))]),
        // m('div.form-group', [m('label.col-md-2 control-label', 'Address Line 2'), m('div.col-md-10 ', m('input.form-control', {
        //     onchange: m.withAttr('value', ctrl.organization.address2),
        //     value: ctrl.organization.address2()
        // }))]),
        // m('div.form-group', [m('label.col-md-2 control-label', 'City'), m('div.col-md-10 ', m('input.form-control', {
        //     onchange: m.withAttr('value', ctrl.organization.name),
        //     value: ctrl.organization.city()
        // }))]),
        // m('div.form-group', [m('label.col-md-2 control-label', 'State'), m('div.col-md-10 ', m('input.form-control', {
        //     onchange: m.withAttr('value', ctrl.organization.tate),
        //     value: ctrl.organization.state()
        // }))]),
        // m('div.form-group', [m('label.col-md-2 control-label', 'Zip'), m('div.col-md-10 ', m('input.form-control', {
        //     onchange: m.withAttr('value', ctrl.organization.zip),
        //     value: ctrl.organization.zip()
        // }))]),
        // m('div.form-group', [m('label.col-md-2 control-label', 'Country'), m('div.col-md-10 ', m('input.form-control', {
        //     onchange: m.withAttr('value', ctrl.organization.country),
        //     value: ctrl.organization.country()
        // }))])
      ]),
      m(".buttons-right", [
        m(
          "button.btn btn-default",
          {
            onclick: function(e) {
              window.history.back();
            }
          },
          t("Cancel")
        ),
        " ",
        m(
          "button.btn btn-success",
          {
            onclick: function() {
              appState
                .saveOrg(org)
                .then(function() {
                  window.history.back();
                })
                .catch(catchhandler);
            }
          },
          t("Save")
        )
      ])
    ]),
    m(".col-sm-3")
  ]);
};
