/* Copyright (c) 2016 Grant Miner */
"use strict";
const t = require("./i18n").translate;
const m = require("mithril");
const appState = require("./appState");
const navbar = require("./navbar");
const moment = require("moment");
const _ = require("lodash");
const withAuth = require("./withAuth");

module.exports.controller = function(args, extras) {
  const ctrl = this;
  let creatingFleet;

  ctrl.cancel = function() {
    ctrl.fleet = {
      name: "",
      vehicles: []
    };
    const state = appState.getState();
    ctrl.fleet.orgid = state.selectedOrg.id;

    ctrl.availableVehicles = [];
    ctrl.selectedAvailableVehicles = [];
    ctrl.selectedInFleetVehicles = [];
  };
  ctrl.cancel();

  ctrl.getVehicleById = function(vid) {
    const state = appState.getState();
    if (state.vehiclesByID[vid]) {
      return state.vehiclesByID[vid];
    } else {
      return {};
    }
  };

  ctrl.selectFleet = function(fleet) {
    const state = appState.getState();

    ctrl.fleet = fleet;
    ctrl.availableVehicles = [];
    _.toArray(state.vehiclesByID).forEach(function(vehicle) {
      ctrl.availableVehicles.push(vehicle.id);
    });

    ctrl.colorPickerEl.value = fleet.color;
  };

  ctrl.rightArrow = function() {
    while (ctrl.selectedAvailableVehicles.length) {
      const vid = ctrl.selectedAvailableVehicles.pop();
      const vehicle = ctrl.getVehicleById(vid);

      ctrl.fleet.vehicles = _.union(ctrl.fleet.vehicles, [vehicle.id]);
      ctrl.availableVehicles = _.without(ctrl.availableVehicles, vid);
    }
  };

  ctrl.leftArrow = function() {
    while (ctrl.selectedInFleetVehicles.length) {
      const vid = ctrl.selectedInFleetVehicles.pop();
      const vehicle = ctrl.getVehicleById(vid);

      ctrl.fleet.vehicles = _.without(ctrl.fleet.vehicles, vid);
      ctrl.availableVehicles = _.union(ctrl.availableVehicles, [vid]);
    }
  };

  ctrl.create = function() {
    ctrl.selectFleet({
      name: "",
      color: "",
      vehicles: []
    });
  };

  ctrl.delete = function() {
    appState.deleteFleet(ctrl.fleet);
  };

  ctrl.save = function() {
    const state = appState.getState();
    ctrl.fleet.orgid = state.selectedOrg.id;
    appState.saveFleet(ctrl.fleet);
  };

  ctrl.colorPickerEl = null;
};

const truckSvg = require("./svg/truck");
const getselectvalues = require("./getselectvalues");

module.exports.view = function(ctrl, args, extras) {
  const state = appState.getState();
  const fleets = _.toArray(state.fleetsByID);

  return m("div", [
    m(".col-sm-1"),
    m(".col-sm-10", [
      m(
        ".col-sm-4",
        m(".business-table", [
          m("h4", t("Fleets")),
          m("ul.list-group", [
            fleets.map(function(fleet) {
              return m(
                "li.pointer list-group-item",
                {
                  class: ctrl.fleet.name === fleet.name ? "active" : "",
                  onclick: function() {
                    ctrl.selectFleet(fleet);
                  }
                },
                [truckSvg(16, 16, fleet.color), " ", fleet.name]
              );
            })
          ]),
          // ctrl.fleets().map(function(fleet) {
          // 	return m('div', m('a.pointer', {
          // 		onclick: function() {
          // 			ctrl.fleet(fleet);
          // 		}
          // 	}, fleet.name))
          // }),
          m("br"),
          m(".buttons-right", [
            m(
              "button.btn btn-sm btn-default",
              {
                onclick: ctrl.delete,
                disabled: ctrl.fleet.id == null
              },
              t("Delete")
            ),
            " ",
            m(
              "button.btn btn-sm btn-success",
              {
                onclick: ctrl.create
              },
              t("Create")
            )
          ]),
          m("br")
        ])
      ),
      m(
        ".col-sm-8.business-table",
        m("div", [
          m(".form-group.col-sm-12", [
            m(".row", [
              m(".form-group.col-sm-4", [
                m("label.control-label", t("Fleet Name") + ":"),
                m(
                  "div",
                  m("input.form-control", {
                    disabled: ctrl.fleet.name == null,
                    value: ctrl.fleet.name ? ctrl.fleet.name : "",
                    onblur: function(ev) {
                      ctrl.fleet.name = ev.target.value;
                    }
                  })
                )
              ]),
              m(".form-group.col-sm-2"),
              m(".form-group.col-sm-6", [
                m("label.col-sm-2 control-label", t("Fleet Color") + ":"),
                m("input[type=color]", {
                  oncreate: function(vnode) {
                    ctrl.colorPickerEl = vnode.dom;
                  },
                  onchange: function(ev) {
                    ctrl.fleet.color = ev.target.value;
                  }
                })
              ])
            ])
          ]),

          m(".form-group", [
            m(".col-sm-5", [
              m("div", t("Available Vehicles")),
              m(
                "select.fullwidth.form-control[multiple][size=20]",
                {
                  onblur: function(ev) {
                    ctrl.selectedAvailableVehicles = getselectvalues(ev.target);
                  }
                },
                ctrl.availableVehicles.map(function(vid) {
                  return m(
                    "option",
                    {
                      value: vid
                    },
                    ctrl.getVehicleById(vid).name
                  );
                })
              )
            ]),
            m(
              ".col-sm-2.verticalcenter",
              {
                style: {
                  "margin-top": "10em"
                }
              },
              [
                m(
                  "button.btn-lg btn-default",
                  {
                    onclick: ctrl.rightArrow
                  },
                  "→"
                ),
                " ",
                m(
                  "button.btn-lg btn-default",
                  {
                    onclick: ctrl.leftArrow
                  },
                  "←"
                )
              ]
            ),
            m(".col-sm-5", [
              m("div", t("Vehicles in Fleet")),
              m(
                "select.fullwidth.form-control[multiple][size=20]",
                {
                  onblur: function(ev) {
                    ctrl.selectedInFleetVehicles = getselectvalues(ev.target);
                  }
                },
                ctrl.fleet.vehicles.map(function(vid) {
                  return m(
                    "option",
                    {
                      value: vid
                    },
                    ctrl.getVehicleById(vid).name
                  );
                })
              )
            ])
          ]),

          m(
            ".buttons-right",
            {
              style: {
                "margin-top": "2em"
              }
            },
            [
              m(
                "button.btn btn-sm btn-default",
                {
                  onclick: ctrl.cancel
                },
                t("Cancel")
              ),
              " ",
              m(
                "button.btn btn-sm btn-success",
                {
                  disabled: ctrl.fleet.name.trim() === "",
                  onclick: ctrl.save
                },
                t("Save")
              )
            ]
          )
        ])
      )
    ]),
    m(".col-sm-1")
  ]);
};
