/* Copyright (c) 2016 Grant Miner */
"use strict";

module.exports = function(select) {
  const result = [];
  const options = select && select.options;
  let opt;

  for (let i = 0, iLen = options.length; i < iLen; i++) {
    opt = options[i];

    if (opt.selected) {
      result.push(opt.value);
    }
  }
  return result;
};
