/* Copyright (c) 2016 Grant Miner */
"use strict";
const m = require("mithril");
const catchhandler = require("./catchhandler");
const Vehicle = require("../common/models/Vehicle");
const orgselector = require("./orgselector");
const _ = require("lodash");
const appState = require("./appState");
const keyhelper = require("./keyhelper");

module.exports.oninit = function() {
  const state = appState.getState();
  this.vehicle = new Vehicle(state.vehiclesByID[state.viewID]);

  if (state.vehiclesByID[state.viewID]) {
    this.editing = true;
  } else {
    this.editing = false;
    this.vehicle = new Vehicle();
    this.vehicle.id = state.viewID;
  }

  // appState.getStore().subscribe(function () {
  // 	const state = appState.getState();
  // 	if (state.vehiclesByID[this.vehicle.id]) {
  // 		this.vehicle = state.vehiclesByID[this.vehicle.id];
  // 		m.redraw();
  // 	}
  // })

  this.save = () => {
    let p;
    if (this.editing) {
      p = appState.putVehicle(this.vehicle);
    } else {
      p = appState.postVehicle(this.vehicle);
    }
    p.then(() => {
      window.history.back();
    }).catch(catchhandler);
  };
};
const formitem = require("./formitem");

module.exports.view = function() {
  const state = appState.getState();
  const devices = _.toArray(state.devicesByID).filter(device => device.orgid == state.selectedOrg.id);

  return m(".div", [
    m(".col-md-3"),
    m(".col-md-6 business-table", [
      m(".btn", this.editing ? "Edit Vehicle" : "New Vehicle"),
      m("form.form-horizontal", [
        Object.keys(this.vehicle).map(key => {
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
                      onchange: ev => {
                        if (ev &&ev.target) {
                          this.vehicle[key] = ev.target.value;
                        }
                      },
                      value: this.vehicle[key]
                    },
                    _.union([{ id: "" }], devices).map(device => {
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
                      value: this.vehicle[key]
                    },
                    m(
                      "option",
                      {
                        value: this.vehicle[key]
                      },
                      this.vehicle[key]
                    )
                  )
                )
              ]);
            }
          } else if (key === "orgid") {
            return orgselector(this.vehicle, 4, 8);
          } else {
            return formitem(this.vehicle, key, 4, 8, key === "id");
            // return m('div.form-group', [m('label.col-md-4 control-label', _.capitalize(key)), m('div.col-md-8', m('input.form-control', {
            // 	onchange: m.withAttr('value', this.vehicle[key]),
            // 	value: this.vehicle[key]()
            // }))])
          }
        })
      ]),
      m(".buttons-right", [
        m(
          "button.btn btn-default",
          {
            onclick: e => {
              window.history.back();
            }
          },
          "Cancel"
        ),
        " ",
        m(
          "button.btn btn-success",
          {
            onclick: this.save
          },
          "Save"
        )
      ])
    ]),
    m(".col-md-3")
  ]);
};
