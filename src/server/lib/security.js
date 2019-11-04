/* Copyright (c) 2016 Grant Miner */
"use strict";
const getUser = require("./dao").getUser;
const get = require("lodash").get;

module.exports.mustBeAdmin = async function mustBeAdmin(ctx, next) {
  if (ctx.state.user.isAdmin !== true) {
    ctx.status = 403;
    ctx.body = { success: "false", message: "Must be admin" };
  } else {
    await next();
  }
};

module.exports.mustBeAdminOrOrgAdmin = async function mustBeAdminOrOrgAdmin(
  ctx,
  next
) {
  if (
    get(ctx, "state.user.isAdmin") === true ||
    (get(ctx, "state.user.isOrgAdmin") === true &&
      get(ctx, "state.user.orgid") === get(ctx, "params.orgid"))
  ) {
    await next();
  } else {
    ctx.status = 403;
    ctx.body = { success: "false", message: "Access denied" };
  }
};

module.exports.mustBeObjectOwnerOrAdminOrOrgAdmin = async function mustBeObjectOwnerOrAdminOrOrgAdmin(
  ctx,
  next
) {
  function fail() {
    ctx.status = 403;
    ctx.body = { success: "false", message: "Access denied" };
    return;
  }

  if (
    get(ctx, "state.user.isAdmin") === true ||
    (get(ctx, "state.user.isOrgAdmin") === true &&
      get(ctx, "state.user.orgid") === get(ctx, "request.body.orgid"))
  ) {
    return next();
  } else {
    let url = ctx.request.path.split("/");
    // e.g., ["", "api", "organizations", "default", "users"]

    let objType = url[4];

    if (url[4] === "users" || url[2] === "users") {
      let username = ctx.state.user.username;
      let obj = await getUser(ctx.params.id);

      if (username === obj.username) {
        await next();
      } else {
        fail();
      }
    } else {
      fail();
    }
  }
};

module.exports.onlyAdminCanSetAdmin = async function onlyAdminCanSetAdmin(
  ctx,
  next
) {
  if (get(ctx, "state.user.isAdmin") === true) {
    await next();
  } else if (get(ctx, "state.user.isOrgAdmin") === true) {
    delete ctx.request.body.isAdmin;
    await next();
  } else {
    delete ctx.request.body.isAdmin;
    delete ctx.request.body.isOrgAdmin;
    await next();
  }
};

module.exports.mustBeAdminOrOrgMember = async function mustBeAdminOrOrgMember(
  ctx,
  next
) {
  if (
    get(ctx, "state.user.isAdmin") === true ||
    get(ctx, "state.user.orgid") === get(ctx, "params.orgid")
  ) {
    await next();
  } else {
    ctx.status = 403;
    ctx.body = { success: "false", message: "Access denied" };
  }
};
