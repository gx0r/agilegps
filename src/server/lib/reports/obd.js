/* Copyright (c) 2016 Grant Miner */
"use strict";
module.exports = history =>
  history.filter(item => item.cmd === "OBD" || item.cmd === "OSM");
