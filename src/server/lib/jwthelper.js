/* Copyright (c) 2016 Grant Miner */
"use strict";
const Promise = require("bluebird");
const assert = require("assert");
const JWT = require("jsonwebtoken");
Promise.promisifyAll(JWT);
const unless = require("koa-unless");
const jwtSecret = require("../../../config/web.js").jwtSecret;

module.exports.jwtSignDefault = function jwtSignDefault(obj, options) {
  options || {};
  // options.expiresInMinutes = 60;
  return JWT.sign(obj, jwtSecret, options);
};

module.exports.jwtCookie = function jwtCookie(opts) {
  opts = opts || {};
  opts.key = opts.key || "user";
  assert(opts.secret, '"secret" option is required');

  const middleware = async function(ctx, next) {
    const token = ctx.cookies.get("jwt");
    let user, err;

    try {
      user = await JWT.verify(token, opts.secret, opts);
    } catch (e) {
      err = e;
    }

    if (user != null) {
      ctx.state = ctx.state || {};
      ctx.state[opts.key] = user;
    }

    if (user != null || opts.passthrough) {
      await next();
    } else {
      ctx.throw(401, err);
    }
  };

  middleware.unless = unless;
  return middleware;
};
