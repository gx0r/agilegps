/* Copyright (c) 2016 Grant Miner */
"use strict";
const t = require("./i18n").translate;
const m = require("mithril");
const keyhelper = require("./keyhelper");
const Promise = require("bluebird");
const bcrypt = Promise.promisifyAll(require('bcryptjs'));

let passwordChangeVisible = false;
let changing = false;
let newPassword = '';

module.exports = function (obj, key, col1, col2, disabled) {
    col1 = col1 || 2;
    col2 = col2 || 10;

    const renderChanging = () => {
      return [
        m("div", {
            style: {
              marginTop: "4px",
              fontWeight: "normal"
            }
          },
          m("input.form-control", {
            type: passwordChangeVisible ? "text" : "password",
            placeholder: "Type the new password here, then click the \"Hash and Apply Password\" button.",
            onblur: ev => {
              newPassword = ev.target.value;
            },
            disabled: false,
          }),
          m("button.btn btn-success btn-xs", {
            style: {
              marginTop: "4px",
            },
            onclick: ev => {
              ev.preventDefault();
              bcrypt.genSaltAsync(10).then(salt => {
                  return bcrypt.hash(newPassword, salt);
                })
                .then(hashed => {
                  obj[key] = hashed;
                  newPassword = '';
                  changing = false;
                  m.redraw();
                });
            },
          }, "Hash and Apply Password"),
          m("label", {
            style: {
              fontWeight: "normal",
            }
          },
          [
            m("input[type=checkbox]", {
              style: {
                verticalAlign: "-3px",
                marginLeft: "1em",
              },
              checked: passwordChangeVisible,
              onclick: ev => passwordChangeVisible = ev.target.checked,
            }), " Show typed characters"
          ]),
          m("div", {
            style: {
              verticalAlign: "-3px",
              marginLeft: "m",
            }
          }, "After applying a new password you still must Save the user for the password change to take effect.")
        )];
      }

      return m(
        "div.form-group",
        m("label.col-md-" + col1 + " control-label", t(keyhelper(key)) + ":"),
        m(
          "div.col-md-" + col2,
          [
            [m("div", "Hashed password:"), m("input.form-control", {
              disabled: true,
              value: obj[key]
            })],
            changing && renderChanging(),
            !changing && m("button.btn btn-warning btn-xs", {
              style: {
                marginTop: "4px",
              },
              onclick: ev => {
                ev.preventDefault();
                changing = true;
              },
            }, "Change Password"),
            !changing && obj[key].length > 0 && m("button.btn btn-success btn-xs", {
              style: {
                marginLeft: "4px",
                marginTop: "4px",
              },
              onclick: ev => {
                ev.preventDefault();
                const testInput = window.prompt("Enter password to try:");
                const matched = bcrypt.compareSync(testInput, obj[key]);
                if (matched) {
                  window.alert('The password was correct.');
                } else {
                  window.alert('The password was incorrect.');
                }
              },
            }, "Test Password"),
          ]
        )
      );
    };
