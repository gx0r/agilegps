/* Copyright (c) 2016 Grant Miner */
"use strict";
const m = require("mithril");
const catchhandler = require("./catchhandler");
const Vehicle = require("../common/models/Vehicle");
const orgselector = require("./orgselector");
const _ = require("lodash");
const appState = require("./appState");
const keyhelper = require("./keyhelper");

module.exports.controller = function(args, extras) {
  const ctrl = this;
  const state = appState.getState();
  ctrl.vehicle = new Vehicle(state.vehiclesByID[state.viewID]);

  if (state.vehiclesByID[state.viewID]) {
    ctrl.editing = true;
  } else {
    ctrl.editing = false;
    ctrl.vehicle = new Vehicle();
    ctrl.vehicle.id = state.viewID;
  }

  // appState.getStore().subscribe(function () {
  // 	const state = appState.getState();
  // 	if (state.vehiclesByID[ctrl.vehicle.id]) {
  // 		ctrl.vehicle = state.vehiclesByID[ctrl.vehicle.id];
  // 		m.redraw();
  // 	}
  // })

  ctrl.save = function() {
    let p;
    if (ctrl.editing) {
      p = appState.putVehicle(ctrl.vehicle);
    } else {
      p = appState.postVehicle(ctrl.vehicle);
    }
    p.then(function() {
      window.history.back();
    }).catch(catchhandler);
  };
};
const formitem = require("./formitem");

module.exports.view = function(ctrl, args, extras) {
  const state = appState.getState();

  const devices = _.toArray(state.devicesByID).filter(function(device) {
    return device.orgid == state.selectedOrg.id;
  });

  return m(".div", [
    m(".col-md-3"),
    m(".col-md-6 business-table", [
      m(".btn", ctrl.editing ? "Edit Vehicle" : "New Vehicle"),
      m("form.form-horizontal", [
        Object.keys(ctrl.vehicle).map(function(key) {
          if (key === "device") {
            if (state.user.isAdmin) {
              // admins can change devices
              return m("div.form-group", [
                m("label.col-md-4 control-label", keyhelper(key) + ":"),
                m(
                  "div.col-md-8",
                  m(
                    "select.form-control",
                    {
                      onchange: function(ev) {
                        if (ev.target) {
                          ctrl.vehicle[key] = ev.target.value;
                        }
                      },
                      value: ctrl.vehicle[key]
                    },
                    _.union([{ id: "" }], devices).map(function(device) {
                      return m(
                        "option",
                        {
                          value: device.imei
                        },
                        device.imei
                      );
                    })
                  )
                )
              ]);
            } else {
              return m("div.form-group", [
                m("label.col-md-4 control-label", keyhelper(key) + ":"),
                m(
                  "div.col-md-8",
                  m(
                    "select.form-control[disabled]",
                    {
                      value: ctrl.vehicle[key]
                    },
                    m(
                      "option",
                      {
                        value: ctrl.vehicle[key]
                      },
                      ctrl.vehicle[key]
                    )
                  )
                )
              ]);
            }
          } else if (key === "orgid") {
            return orgselector(ctrl.vehicle, 4, 8);
          } else {
            return formitem(ctrl.vehicle, key, 4, 8, key === "id");
            // return m('div.form-group', [m('label.col-md-4 control-label', _.capitalize(key)), m('div.col-md-8', m('input.form-control', {
            // 	onchange: m.withAttr('value', ctrl.vehicle[key]),
            // 	value: ctrl.vehicle[key]()
            // }))])
          }
        })
      ]),
      m(".buttons-right", [
        m(
          "button.btn btn-default",
          {
            onclick: function(e) {
              window.history.back();
            }
          },
          "Cancel"
        ),
        " ",
        m(
          "button.btn btn-success",
          {
            onclick: ctrl.save
          },
          "Save"
        )
      ])
    ]),
    m(".col-md-3")
  ]);
};
