/* Copyright (c) 2016 Grant Miner */
"use strict";
const t = require("./i18n").translate;
const m = require("mithril");
const appState = require("./appState");
const _ = require("lodash");
const sorts = require("./sorts");
const moment = require("moment");
const catchhandler = require("./catchhandler");

function hearbeatField(device) {
  return device.lastHeartbeat
    ? [
        m(
          "span",
          {
            style: {
              color: "red"
            }
          },
          "♥ "
        ),
        moment(device.lastHeartbeat).fromNow()
      ]
    : "";
}

function batteryField(device) {
  return device.batteryPercent
    ? m(
        "span",
        {
          style: {
            "margin-left": "1em"
          }
        },
        "" + device.batteryPercent + "%🔋"
      )
    : "";
}

function deleteDevice(device) {
  const result = window.confirm(
    "Are you sure you want to delete " + device.imei + "?"
  );
  if (result === true) {
    appState.deleteDevice(device).catch(catchhandler);
  }
}

module.exports.oninit = function() {
  const update = () => {
    const state = appState.getState();
    let changed = false;
    if (state.vehiclesByDeviceID !== this.vehiclesByDeviceID) {
      this.vehiclesByDeviceID = state.vehiclesByDeviceID;
      changed = true;
    }
    if (this.devicesByID !== state.devicesByID) {
      this.devicesByID = state.devicesByID;
      this.devicesByIDarray = _.toArray(this.devicesByID);
      changed = true;
    }

    if (changed) {
      this.vehiclesByDeviceID = {};
      _.toArray(state.vehiclesByID).forEach(vehicle => {
        this.vehiclesByDeviceID[vehicle.device] = vehicle;
      });
    }
  }

  update();
  this.unsubsribe = appState.getStore().subscribe(update);
};

module.exports.onremove = function() {
  this.unsubsribe();
}

module.exports.view = function() {
  const vehiclesByDeviceID = this.vehiclesByDeviceID;

  return m(".business-table", [
    m(
      "button.btn btn-default",
      {
        style: {
          "margin-bottom": "1em"
        },
        onclick: () => {
          appState.viewNewDevice();
        }
      },
      t("New Device")
    ),
    m(
      "table.table table-bordered table-striped",
      sorts(this.devicesByIDarray),
      [
        m(
          "thead",
          m("tr", [
            m("th[data-sort-by=imei]", t("IMEI")),
            m("th[data-sort-by=sim]", t("SIM")),
            m("th[data-sort-by=orgid]", t("Organization")),
            m("th[data-sort-by=status]", t("Active")),
            m("th[data-sort-by=hearbeat]", t("Heartbeat")),
            m("th[data-sort-by=batteryPercent]", t("Battery")),
            m("th[data-sort-by=phone]", t("Phone")),
            m("th[data-sort-by=network]", t("Network")),
            m("th[data-sort-by=activationDate]", t("Activation Date")),
            m("th[data-sort-by=vehicle.name]", t("Associated Vehicle")),
            m("th", t("Operations"))
          ])
        ),
        m("tbody", [
          this.devicesByIDarray.map(device => {
            return m("tr", [
              m("td", device.imei),
              m("td", device.sim),
              m("td", appState.getOrgName(device.orgid)),
              m("td", device.active ? "✔" : ""),
              m("td", hearbeatField(device)),
              m("td", batteryField(device)),
              m("td", device.phone),
              m("td", device.network),
              m(
                "td",
                device.activationDate
                  ? moment(device.activationDate).format("M/DD/YYYY")
                  : device.activationDate
              ),
              m(
                "td",
                m(
                  "a",
                  {
                    href: "#",
                    onclick: ev => {
                      ev.preventDefault();
                      appState.viewVehicleByID(
                        vehiclesByDeviceID[device.imei].id
                      );
                    }
                  },
                  vehiclesByDeviceID[device.imei]
                    ? vehiclesByDeviceID[device.imei].name
                    : ""
                )
              ),
              m("td", [
                m(
                  "a.btn btn-primary btn-sm btn-warning ",
                  {
                    onclick: ev => {
                      ev.preventDefault();
                      appState.viewDeviceByID(device.imei);
                    }
                  },
                  m("span.middle glyphicon glyphicon-pencil"),
                  " " + t("Update")
                ),
                " ",
                m(
                  "a.btn btn-primary btn-sm btn-danger",
                  {
                    onclick: () => {
                      deleteDevice(device);
                    }
                  },
                  m("span.middle glyphicon glyphicon-trash"),
                  " " + t("Delete")
                )
              ])
            ]);
          })
        ])
      ]
    )
  ]);
};
