/* Copyright (c) 2016 Grant Miner */
"use strict";
const m = require("mithril");
const alertTypes = ["Location Enter", "Location Exit", "Speed Alert"];

module.exports.view = function() {
  return m("div", [
    m(".col-sm-1"),
    m(".col-sm-10", [
      m(
        ".col-sm-4",
        m(".business-table", [
          m("h4", "Alert Types"),
          m("ul.list-group", [
            alertTypes.map(function(alert) {
              return m(
                "li.pointer list-group-item",
                {
                  class: this.selectedAlert === alert ? "active" : "",
                  onclick: () => this.selectedAlert = alert,
                },
                alert
              );
            })
          ])
        ])
      ),
      m(".col-sm-8", m(".business-table", [m("h4", this.selectedAlert)]))
    ]),
    m(".col-sm-1")
  ]);
};
