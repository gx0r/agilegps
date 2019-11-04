/* Copyright (c) 2016 Grant Miner */
"use strict";
// Run this to auto-reload the server on file changes.
const nodemon = require("nodemon");

nodemon({
  script: "listen.js",
  ext: "js json",
  execMap: {
    js: "node"
  },
  ignore: [".git", "client/**", "**/*.spec.js"]
});
