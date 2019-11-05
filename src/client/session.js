/* Copyright (c) 2016 Grant Miner */
"use strict";
import { translate as t } from "./i18n";
const m = require("mithril");
const appState = require("./appState");
const catchhandler = require("./catchhandler");

module.exports.oninit = function(vnode) {
  const state = appState.getState();

  this.username = state.user.username ? state.user.username : "";
  this.password = "";
  this.loggingIn = false;
  this.rememberMe = false;
  this.error = "";

  const store = require("./appState").getStore();

  this.loginClick = () => {
    this.loggingIn = true;
    this.error = "";
    m.redraw();

    appState
      .login({
        username: this.username.trim(),
        password: this.password,
        rememberMe: this.rememberMe
      })
      .then(() => {
        this.loggingIn = false;
        m.redraw();

        const state = appState.getState();

        if (!state.user.isAdmin) {
          return appState.viewOrgByID(state.user.orgid);
        } else {
          return appState.viewOrganizations();
        }
      })
      .catch(err => {
        this.loggingIn = false;
        this.error = err.message;
        m.redraw();
      });
  };

  this.logoutClick = function() {
    let wantsToLogout = window.confirm(t("Are you sure you wish to logout?"));
    if (!wantsToLogout) return;
    this.loggingIn = true;
    this.error = "";
    m.redraw();

    appState
      .logOut()
      .then(() => {
        this.loggingIn = false;
        m.redraw();
      })
      .catch(err => {
        this.loggingIn = false;
        this.error = err.message;
      });
  };
};

module.exports.view = function(vnode) {
  const state = appState.getState();

  const buttonText = () => {
    if (this.loggingIn) {
      return t("Authorizing...");
    } else {
      return t("Log In");
    }
  }

  const logo = () => {
    return m("img[src=images/logo2.png]");
  }

  return m("div", [
    m(
      ".row center-block",
      {
        style: {
          width: "400px",
          "margin-right": "2px",
          border: "solid thin black",
          padding: "2em"
        }
      },
      [
        !state.user.username
          ? m("input.form-control", {
              placeholder: t("Username"),
              autofocus: true,
              oninput: ev => {
                this.username = ev.target.value;
              },
              onkeyup: ev => {
                if (ev.keyCode === 13) {
                  this.loginClick();
                }
              },
              value: this.username
            })
          : null,
        !state.user.username
          ? m("input.form-control", {
              placeholder: t("Password"),
              type: "password",
              oninput: ev => {
                this.password = ev.target.value;
              },
              onkeyup: ev => {
                if (ev.keyCode === 13) {
                  this.loginClick();
                } else {
                  console.warn("m.redraw.strategy() does not exist in mithril 1.0");
                  if(m.redraw.strategy) {
                    m.redraw.strategy("none");
                  }
                }
              },
              value: this.password
            })
          : null,

        !state.user.username
          ? m(
              "label",
              m("input[type=checkbox]", {
                checked: this.rememberMe,
                onclick: function() {
                  this.rememberMe(this.checked);
                }
              }),
              t("Remember Me")
            )
          : null,

        m(
          "div",
          {
            style: {
              "text-align": "right",
              "margin-top": "2px"
            }
          },
          [
            state.user.username
              ? m(
                  "button.btn btn-default",
                  {
                    class: this.loggingIn ? "" : "btn-default",
                    style: {
                      float: "left"
                    },
                    onclick: this.logoutClick,
                    disabled: this.loggingIn
                  },
                  t("Log Out") + " " + state.user.username
                )
              : null,

            !state.user.username
              ? m(
                  "button.btn btn-default",
                  {
                    class: this.loggingIn ? "" : "btn-success",
                    onclick: this.loginClick,
                    disabled: this.loggingIn
                  },
                  buttonText()
                )
              : null
          ]
        ),
        m("br"),
        m("div.text-danger", this.error? "Error: " + this.error : "")
      ]
    ),
    m(
      ".row",
      m(
        ".center-block",
        {
          style: {
            "margin-top": "2em",
            "text-align": "center"
          }
        },
        getLogo()
      )
    )
  ]);
};
