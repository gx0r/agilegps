/* Copyright (c) 2016 Grant Miner */
"use strict";
const t = require("./i18n").translate;
const m = require("mithril");
const appState = require("./appState");
const catchhandler = require("./catchhandler");
const Organization = require("../common/models/Organization");
const keyhelper = require("./keyhelper");

module.exports.oninit = function() {
  const state = appState.getState();
  this.org = new Organization(state.orgsByID[state.viewID]);

  if (state.orgsByID[state.viewID]) {
    this.editing = true;
  } else {
    this.editing = false;
    this.org = new Organization();
    this.org.id = state.viewID;
  }

  // appState.getStore().subscribe(function () {
  // 	const state = appState.getState();
  // 	if (state.orgsByID[this.org.id]) {
  // 		this.org = state.orgsByID[this.org.id];
  // 		m.redraw();
  // 	}
  // })
};

module.exports.view = function() {
  const org = this.org;
  const editing = this.editing;

  return m("div", [
    m(".col-sm-3"),
    m(".business-table col-sm-6 ", [
      m(
        ".btn.center",
        editing ? t("Edit Organization") : t("Create Organization")
      ),
      m("form.form-horizontal", [
        Object.keys(org).map(key => {
          return m("div.form-group", [
            m("label.col-md-2 control-label", t(keyhelper(key)) + ":"),
            m(
              "div.col-md-10",
              m("input.form-control", {
                onchange: ev => {
                  if (ev.target) {
                    org[key] = ev.target.value;
                  }
                },
                disabled: key === "id",
                value: org[key]
              })
            )
          ]);
        })
        // m('div.form-group', [m('label.col-md-2 control-label', 'Name'), m('div.col-md-10 ', m('input.form-control', {
        //     onchange: m.withAttr('value', this.organization.name),
        //     value: this.organization.name()
        // }))]),
        // m('div.form-group', [m('label.col-md-2 control-label', 'EIN'), m('div.col-md-10 ', m('input.form-control', {
        //     onchange: m.withAttr('value', this.organization.ein),
        //     value: this.organization.ein()
        // }))]),
        // m('div.form-group', [m('label.col-md-2 control-label', 'Address Line 1'), m('div.col-md-10 ', m('input.form-control', {
        //     onchange: m.withAttr('value', this.organization.address1),
        //     value: this.organization.address1()
        // }))]),
        // m('div.form-group', [m('label.col-md-2 control-label', 'Address Line 2'), m('div.col-md-10 ', m('input.form-control', {
        //     onchange: m.withAttr('value', this.organization.address2),
        //     value: this.organization.address2()
        // }))]),
        // m('div.form-group', [m('label.col-md-2 control-label', 'City'), m('div.col-md-10 ', m('input.form-control', {
        //     onchange: m.withAttr('value', this.organization.name),
        //     value: this.organization.city()
        // }))]),
        // m('div.form-group', [m('label.col-md-2 control-label', 'State'), m('div.col-md-10 ', m('input.form-control', {
        //     onchange: m.withAttr('value', this.organization.tate),
        //     value: this.organization.state()
        // }))]),
        // m('div.form-group', [m('label.col-md-2 control-label', 'Zip'), m('div.col-md-10 ', m('input.form-control', {
        //     onchange: m.withAttr('value', this.organization.zip),
        //     value: this.organization.zip()
        // }))]),
        // m('div.form-group', [m('label.col-md-2 control-label', 'Country'), m('div.col-md-10 ', m('input.form-control', {
        //     onchange: m.withAttr('value', this.organization.country),
        //     value: this.organization.country()
        // }))])
      ]),
      m(".buttons-right", [
        m(
          "button.btn btn-default",
          {
            onclick: e => {
              window.history.back();
            }
          },
          t("Cancel")
        ),
        " ",
        m(
          "button.btn btn-success",
          {
            onclick: () => {
              appState
                .saveOrg(org)
                .then(() => {
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
