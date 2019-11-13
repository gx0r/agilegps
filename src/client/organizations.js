/* Copyright (c) 2016 Grant Miner */
"use strict";
const t = require("./i18n").translate;
const m = require("mithril");
const appState = require("./appState");
const navbar = require("./navbar");
const catchhandler = require("./catchhandler");
const withAuth = require("./withAuth");

module.exports.oninit = function() {
  this.delete = function(org) {
    let result = window.confirm(
      "Are you sure you want to delete organization " + org.name + "?"
    );

    if (result === true) {
      appState.deleteOrg(org).catch(catchhandler);
    }
  };
};

module.exports.view = function(vnode) {
  const state = appState.getState();
  const isAdmin = state.user.isAdmin;

  return m(".div", [
    m(".col-md-2"),
    m(
      ".business-table col-md-8",
      {
        // class: !isAdmin ? 'col-sm-4' : 'col-sm-9'
      },
      [
        !isAdmin
          ? ""
          : m(
              "button.btn btn-default",
              {
                style: {
                  "margin-bottom": "1em"
                },
                onclick: function() {
                  appState.viewNewOrganization();
                }
              },
              t("Create Organization")
            ),
        m("table.table table-bordered table-striped", [
          m(
            "thead",
            m("tr", [m("th", t("Name")), m("th", ""), m("th", ""), m("th", "")])
          ),
          m("tbody", [
            _.toArray(state.orgsByID).map(function(org) {
              return m("tr", [
                m("td", org.name),
                m(
                  "td",
                  " ",
                  !isAdmin
                    ? ""
                    : m(
                        "a.btn btn-primary btn-sm",
                        {
                          onclick: function(ev) {
                            appState.editOrganization(org.id);
                          }
                        },
                        m("span.middle glyphicon glyphicon-pencil"),
                        " " + t("Update")
                      )
                ),

                m(
                  "td",
                  m(
                    "a.btn btn-primary btn-sm",
                    {
                      onclick: function(ev) {
                        appState.selectOrgByID(org.id).then(function() {
                          appState.viewOrgByID(org.id);
                        });
                      }
                    },
                    m("span.middle glyphicon glyphicon-search"),
                    " " + t("Log In")
                  )
                ),

                m(
                  "td",
                  m(
                    "a.btn btn-primary btn-sm",
                    {
                      onclick: function(ev) {
                        ev.preventDefault();
                        vnode.delete(org);
                      }
                    },
                    m("span.middle glyphicon glyphicon-trash"),
                    " " + t("Delete")
                  )
                )
              ]);
            })
          ])
        ])
      ]
    ),
    m(".col-md-3")
  ]);
};
