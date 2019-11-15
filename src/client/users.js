/* Copyright (c) 2016 Grant Miner */
"use strict";
const t = require("./i18n").translate;
const m = require("mithril");
const appState = require("./appState");
const sorts = require("./sorts");
const catchhandler = require("./catchhandler");
const _ = require("lodash");

function deleteUser(user) {
  const result = window.confirm(
    "Are you sure you want to delete " + user.username + "?"
  );

  if (result === true) {
    appState.deleteUser(user).catch(catchhandler)
  }
}

function getSecurtyLevel(user) {
  if (user == null) {
    return t("User");
  }
  if (user.isAdmin && user.isOrgAdmin) {
    return t("Site Admin and Organization Admin");
  }
  if (user.isAdmin) {
    return t("Site Admin");
  }
  if (user.isOrgAdmin) {
    return t("Organization Admin");
  }
  return t("User");
}

module.exports.oninit = function() {
  const update = () => {
    const state = appState.getState();
    if (this.usersByID !== state.usersByID) {
      this.usersByID = state.usersByID;
      this.usersByIDarray = _.toArray(this.usersByID);  
    }
    this.orgid = state.selectedOrg.id;  
    if (state.subview != "ALL") {
      this.usersByIDarray = this.usersByIDarray.filter(user => user.orgid === this.orgid);
    }  
  }

  update();
  this.unsubsribe = appState.getStore().subscribe(update);
};

module.exports.onremove = function() {
  this.unsubsribe();
}

module.exports.view = function() {
  const orgid = this.orgid;

  return m(".div", [
    m(".col-md-2"),
    m(".col-md-8 business-table", [
      m(
        "button.btn btn-default",
        {
          style: {
            "margin-bottom": "1em"
          },
          onclick: () => {
            appState.viewNewUser();
          }
        },
        t("New User")
      ),
      m("table.table table-bordered table-striped", sorts(this.usersByIDarray), [
        m(
          "thead",
          m("tr", [
            m("th[data-sort-by=username]", t("Username")),
            m("th[data-sort-by=email]", t("Email")),
            m("th[data-sort-by=firstname]", t("First Name")),
            m("th[data-sort-by=lastname]", t("Last Name")),
            m("th[data-sort-by=isOrgAdmin]", t("Security Level")),
            orgid ? "" : m("th[data-sort-by=orgid]", t("Organization")),
            m("th", t("Operations"))
          ])
        ),
        m("tbody", [
          this.usersByIDarray.map(user => {
            return m("tr", [
              m("td", user.username),
              m("td", user.email),
              m("td", user.firstname),
              m("td", user.lastname),
              m("td", getSecurtyLevel(user)),
              orgid ? "" : m("td", appState.getOrgName(user.orgid)),
              m("td", [
                m(
                  "a.btn btn-primary btn-sm  ",
                  {
                    onclick: ev => {
                      ev.preventDefault();
                      appState.viewUserByID(user.username);
                    }
                  },
                  m("span.middle glyphicon glyphicon-pencil"),
                  " " + t("Update")
                ),
                " ",
                m(
                  "a.btn btn-primary btn-sm ",
                  {
                    onclick: ev => {
                      ev.preventDefault();
                      deleteUser(user);
                    }
                  },
                  m("span.middle glyphicon glyphicon-trash"),
                  " " + t("Delete")
                )
              ])
            ]);
          })
        ])
      ])
    ]),
    m(".col-md-2")
  ]);
};
