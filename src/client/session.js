/* Copyright (c) 2016 Grant Miner */
"use strict";
const t = require("./i18n").translate;
const m = require("mithril");
const appState = require("./appState");

module.exports.controller = function(args, extras) {
  const ctrl = this;
  const state = appState.getState();

  ctrl.username = m.prop(state.user.username ? state.user.username : "");
  ctrl.password = m.prop("");
  ctrl.loggingIn = false;
  ctrl.rememberMe = m.prop(false);
  ctrl.error = m.prop("");

  const store = require("./appState").getStore();

  ctrl.loginClick = function() {
    ctrl.loggingIn = true;
    ctrl.error("");
    m.redraw();

    appState
      .login({
        username: ctrl.username().trim(),
        password: ctrl.password(),
        rememberMe: ctrl.rememberMe()
      })
      .then(function() {
        ctrl.loggingIn = false;
        m.redraw();

        const state = appState.getState();

        if (!state.user.isAdmin) {
          return appState.viewOrgByID(state.user.orgid);
        } else {
          return appState.viewOrganizations();
        }
      })
      .catch(function(err) {
        ctrl.loggingIn = false;
        ctrl.error(err.message);
        m.redraw();
      });
  };

  ctrl.logoutClick = function() {
    let wantsToLogout = window.confirm(t("Are you sure you wish to logout?"));
    if (!wantsToLogout) return;
    ctrl.loggingIn = true;
    ctrl.error("");
    m.redraw();

    appState
      .logOut()
      .then(function() {
        ctrl.loggingIn = false;
        m.redraw();
      })
      .catch(function(err) {
        ctrl.loggingIn = false;
        ctrl.error(err.message);
      });
  };
};

module.exports.view = function(ctrl) {
  const state = appState.getState();

  function buttonText() {
    if (ctrl.loggingIn) {
      return t("Authorizing...");
    } else {
      return t("Log In");
    }
  }

  function getLogo() {
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
              oninput: m.withAttr("value", ctrl.username),
              onkeyup: function(ev) {
                if (ev.keyCode === 13) {
                  ctrl.loginClick();
                }
              },
              value: ctrl.username()
            })
          : null,
        !state.user.username
          ? m("input.form-control", {
              placeholder: t("Password"),
              type: "password",
              oninput: m.withAttr("value", ctrl.password),
              onkeyup: function(ev) {
                if (ev.keyCode === 13) {
                  ctrl.loginClick();
                } else {
                  m.redraw.strategy("none");
                }
              },
              value: ctrl.password()
            })
          : null,

        !state.user.username
          ? m(
              "label",
              m("input[type=checkbox]", {
                checked: ctrl.rememberMe(),
                onclick: function() {
                  ctrl.rememberMe(this.checked);
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
                    class: ctrl.loggingIn ? "" : "btn-default",
                    style: {
                      float: "left"
                    },
                    onclick: ctrl.logoutClick,
                    disabled: ctrl.loggingIn
                  },
                  t("Log Out") + " " + state.user.username
                )
              : null,

            !state.user.username
              ? m(
                  "button.btn btn-default",
                  {
                    class: ctrl.loggingIn ? "" : "btn-success",
                    onclick: ctrl.loginClick,
                    disabled: ctrl.loggingIn
                  },
                  buttonText()
                )
              : null
          ]
        ),
        m("br"),
        m("div.text-danger", ctrl.error() ? "Error: " + ctrl.error() : "")
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
