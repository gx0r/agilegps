/* Copyright (c) 2016 Grant Miner */
"use strict";
const t = require("./i18n").translate;
const m = require("mithril");
const appState = require("./appState");
const _ = require("lodash");
const catchhandler = require("./catchhandler");

module.exports.oninit = function() {
  this.cancel = () => {
    this.fleet = {
      name: "",
      vehicles: []
    };
    const state = appState.getState();
    this.fleet.orgid = state.selectedOrg.id;

    this.availableVehicles = [];
    this.selectedAvailableVehicles = [];
    this.selectedInFleetVehicles = [];
  };
  this.cancel();

  this.getVehicleById = vid => {
    const state = appState.getState();
    if (state.vehiclesByID[vid]) {
      return state.vehiclesByID[vid];
    } else {
      return {};
    }
  };

  this.selectFleet = fleet => {
    const state = appState.getState();

    this.fleet = fleet;
    this.availableVehicles = [];
    _.toArray(state.vehiclesByID).forEach(vehicle => this.availableVehicles.push(vehicle.id));

    this.colorPickerEl.value = fleet.color;
  };

  this.rightArrow = () => {
    while (this.selectedAvailableVehicles.length) {
      const vid = this.selectedAvailableVehicles.pop();
      const vehicle = this.getVehicleById(vid);

      this.fleet.vehicles = _.union(this.fleet.vehicles, [vehicle.id]);
      this.availableVehicles = _.without(this.availableVehicles, vid);
    }
  };

  this.leftArrow =  () => {
    while (this.selectedInFleetVehicles.length) {
      const vid = this.selectedInFleetVehicles.pop();
      const vehicle = this.getVehicleById(vid);

      this.fleet.vehicles = _.without(this.fleet.vehicles, vid);
      this.availableVehicles = _.union(this.availableVehicles, [vid]);
    }
  };

  this.create = () => {
    this.selectFleet({
      name: "",
      color: "",
      vehicles: []
    });
  };

  this.delete = () => {
    const result = window.confirm(
      "Are you sure you want to delete fleet " + this.fleet.name + "?"
    );

    if (result === true) {
      appState.deleteFleet(this.fleet).catch(catchhandler);
    }
  };

  this.save = () => {
    const state = appState.getState();
    this.fleet.orgid = state.selectedOrg.id;
    appState.saveFleet(this.fleet);
  };

  this.colorPickerEl = null;
};

const truckSvg = require("./svg/truck");
const getselectvalues = require("./getselectvalues");

module.exports.view = function() {
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
            fleets.map(fleet => {
              return m(
                "li.pointer list-group-item",
                {
                  class: this.fleet.name === fleet.name ? "active" : "",
                  onclick: () => {
                    this.selectFleet(fleet);
                  }
                },
                [truckSvg(16, 16, fleet.color), " ", fleet.name]
              );
            })
          ]),
          // this.fleets().map(fleet => {
          // 	return m('div', m('a.pointer', {
          // 		onclick: () => {
          // 			this.fleet(fleet);
          // 		}
          // 	}, fleet.name))
          // }),
          m("br"),
          m(".buttons-right", [
            m(
              "button.btn btn-sm btn-default",
              {
                onclick: this.delete,
                disabled: this.fleet.id == null
              },
              t("Delete")
            ),
            " ",
            m(
              "button.btn btn-sm btn-success",
              {
                onclick: this.create
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
                    disabled: this.fleet.name == null,
                    value: this.fleet.name ? this.fleet.name : "",
                    onblur: ev => {
                      if (ev.target) {
                        this.fleet.name = ev.target.value;
                      }
                    }
                  })
                )
              ]),
              m(".form-group.col-sm-2"),
              m(".form-group.col-sm-6", [
                m("label.col-sm-2 control-label", t("Fleet Color") + ":"),
                m("input[type=color]", {
                  oncreate: vnode => {
                    this.colorPickerEl = vnode.dom;
                  },
                  onchange: ev => {
                    if (ev.target) {
                      this.fleet.color = ev.target.value;
                    }
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
                  onblur: ev => {
                    this.selectedAvailableVehicles = getselectvalues(ev.target);
                  }
                },
                this.availableVehicles.map(vid => {
                  return m(
                    "option",
                    {
                      value: vid
                    },
                    this.getVehicleById(vid).name
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
                    onclick: this.rightArrow
                  },
                  "→"
                ),
                " ",
                m(
                  "button.btn-lg btn-default",
                  {
                    onclick: this.leftArrow
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
                  onblur: ev => {
                    this.selectedInFleetVehicles = getselectvalues(ev.target);
                  }
                },
                this.fleet.vehicles.map(vid => {
                  return m(
                    "option",
                    {
                      value: vid
                    },
                    this.getVehicleById(vid).name
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
                  onclick: this.cancel
                },
                t("Cancel")
              ),
              " ",
              m(
                "button.btn btn-sm btn-success",
                {
                  disabled: this.fleet.name.trim() === "",
                  onclick: this.save
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
