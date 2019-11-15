/* Copyright (c) 2016 Grant Miner */
"use strict";
const t = require("./i18n").translate;
const m = require("mithril");
const appState = require("./appState");
const catchhandler = require("./catchhandler");

function deleteOrganization(org) {
  const result = window.confirm(
    "Are you sure you want to delete organization " + org.name + "?"
  );

  if (result === true) {
    appState.deleteOrg(org).catch(catchhandler);
  }
};

module.exports.oninit = function() {
  const update = () => {
    const state = appState.getState();
    if (this.orgsByID !== state.orgsByID) {
      this.orgsByID = state.orgsByID;
      this.orgsByIDarray = _.toArray(this.orgsByID);  
    }
    this.isAdmin = state.user.isAdmin;
  }

  update();
  this.unsubsribe = appState.getStore().subscribe(update);
};

module.exports.onremove = function() {
  this.unsubsribe();
}

module.exports.view = function() {
  const isAdmin = this.isAdmin;

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
            this.orgsByIDarray.map(org => {
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
                          onclick: () => {
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
                      onclick: ev => {
                        appState.selectOrgByID(org.id)
                        .then(() => {
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
                      onclick: ev => {
                        ev.preventDefault();
                        deleteOrganization(org);
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
