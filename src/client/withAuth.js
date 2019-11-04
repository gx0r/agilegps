/* Copyright (c) 2016 Grant Miner */
"use strict";
const Cookies = require("cookies-js");

module.exports = function withAuth(xhr) {
  const jwt = Cookies.get("jwt");

  if (jwt) {
    xhr.setRequestHeader("Authorization", "Bearer " + jwt);
  }
  return xhr;
};
