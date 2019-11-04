/* Copyright (c) 2016 Grant Miner */
"use strict";
import { translate as t } from "./i18n";
import m from "mithril";
import appState from "./appState";
const Device = require("../common/models/Device");
const catchhandler = require("./catchhandler");
const orgselector = require("./orgselector");
const pikaday = require("pikaday2").default;
const _ = require("lodash");
const moment = require("moment");

module.exports.controller = function(args, extras) {
  const ctrl = this;
  const state = appState.getState();
  ctrl.device = new Device(state.devicesByID[state.viewID]);

  if (state.devicesByID[state.viewID]) {
    ctrl.editing = true;
  } else {
    ctrl.editing = false;
    ctrl.device = new Device();
    ctrl.device.imei = state.viewID;
  }

  // appState.getStore().subscribe(function () {
  // 	const state = appState.getState();
  // 	if (state.devicesByID[ctrl.device.imei]) {
  // 		ctrl.device = state.devicesByID[ctrl.device.imei];
  // 		m.redraw();
  // 	}
  // })

  ctrl.save = function() {
    appState
      .saveDevice(ctrl.device)
      .then(function() {
        window.history.back();
      })
      .catch(catchhandler);
  };
};

const formitem = require("./formitem");

module.exports.view = function(ctrl) {
  const state = appState.getState();
  const device = ctrl.device;

  function lastKey(key) {
    switch (key) {
      case "lastACKCFG":
        return t("Last seen global config acknowledgement:");

      case "lastACKFRI":
        return t("Last seen fix report config acknowledgement:");

      case "lastACKSRI":
        return t("Last seen server registration config acknowledgement:");

      case "lastHeartbeat":
        return [
          t("Last seen heartbeat") + " ",
          m(
            "span",
            {
              style: {
                "font-size": "1.5em",
                color: "red"
              }
            },
            "♥"
          ),
          ":"
        ];

      case "lastACKBSI":
        return t(
          "Last seen bearer setting (GSM data service) config acknowledgement:"
        );

      case "lastGSM":
        return t("Last seen GSM information acknowledgement:");

      case "lastPDP":
        return t("Last seen GPRS connection establishment report:");

      case "lastACKTOW":
        return t("Last seen towing config acknowledgement:");

      case "lastACKSPD":
        return t("Last seen speeding config acknowledgement:");

      case "lastACKJDC":
        return t("Last seen jamming config acknowledgement:");

      default:
        return key;
    }
  }

  return m("div", [
    m(".col-md-3"),
    m("div.col-md-6 business-table", [
      m(".btn", ctrl.editing ? t("Edit Device") : t("New Device")),
      m("form.form-horizontal", [
        Object.keys(device).map(function(key) {
          if (key.indexOf("last") === 0) {
            //lastACKCFG, lastACKFRI, lastACKSRI, lastHeartbeat, etc.
            return m("div.form-group", [
              m("label.col-md-4 control-label", lastKey(key)),
              m(
                ".col-md-8",
                m("input[disabled][class=form-control]", {
                  value: device[key].senddate
                    ? moment(device[key].senddate).format("M/DD/YYYY h:mm:ss A")
                    : moment(device[key]).format("M/DD/YYYY h:mm:ss A")
                })
              )
            ]);
          } else if (key === "orgid") {
            return orgselector(device, 4, 8);
          } else if (key === "activationDate") {
            return m("div.form-group", [
              m("label.col-md-4 control-label", t("Activation Date:") + " "),
              m(".col-md-8", {
                config: function(el, isInitialized) {
                  if (isInitialized) {
                    return;
                  }

                  const input = document.createElement("input");
                  input.className = "form-control";
                  el.appendChild(input);

                  ctrl.datepicker = new pikaday({
                    field: input,
                    onSelect: function() {
                      device.activationDate = this.getDate().toISOString();
                      m.redraw();
                    }
                  });

                  ctrl.datepicker.setDate(device.activationDate);
                }
              })
            ]);
            // return m('div.form-group', [m('label.col-md-2 control-label', _.capitalize(key)), m('div.col-md-10',
            // 	ctrl.datepicker.view())])
          } else if (typeof device[key] === "object") {
            return;
          } else {
            return formitem(device, key, 4, 8, key === "imei" && ctrl.editing);
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
      ]),
      m("label.control-label", "All fields:"),
      m("pre", JSON.stringify(device, null, 4))
    ]),
    m(".col-md-3")
  ]);
};
