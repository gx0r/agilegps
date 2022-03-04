/* Copyright (c) 2016 Grant Miner */
"use strict";
const Promise = require("bluebird");
const mustBeAdmin = require("../security").mustBeAdmin;
const mustBeAdminOrOrgAdmin = require("../security").mustBeAdminOrOrgAdmin;
const onlyAdminCanSetAdmin = require("../security").onlyAdminCanSetAdmin;
const mustBeAdminOrOrgMember = require("../security").mustBeAdminOrOrgMember;
const mustBeObjectOwnerOrAdminOrOrgAdmin = require("../security")
  .mustBeObjectOwnerOrAdminOrOrgAdmin;
const Router = require("koa-router");
const r = require("../../../common/db");
const vehiclestatus = require("./vehiclestatus");
const vehiclehistory = require("./vehiclehistory");
const jwt = require("koa-jwt");
const config = require("../../../../config/web.js");
const jwtSignDefault = require("../jwthelper").jwtSignDefault;
const jwtCookie = require("../jwthelper").jwtCookie;
const moment = require("moment");
const reports = require("../reports");
//const reverseGeo = require('../../../helper/reversegeo');
const bcrypt = Promise.promisifyAll(require("bcryptjs"));

const dao = require("../dao");

const router = (module.exports.router = new Router());
const adapt = require("koa-adapter");

const INVALID_USERNAME_OR_PASSWORD = "Invalid username or password.";

const jwtrequired = adapt(
  jwt({
    secret: config.jwtSecret
  })
);

const jwtoptional = adapt(
  jwt({
    secret: config.jwtSecret,
    passthrough: true
  })
);

// allow cookie-based JWT, e.g., without Authorization header
// useful for report download links
const jwtcookie = jwtCookie({
  secret: config.jwtSecret,
  passthrough: true
});

/****
Login / Logout
***/
router.get("/api/session", jwtrequired, async function(ctx, next) {
  if (ctx.state.user) {
    const user = await dao.getUserByUsername(
      ctx.state.user.username,
      false /* without password */
    );
    if (!user) {
      ctx.status = 401;
      return;
    } else {
      ctx.body = Object.create(null);
      ctx.body.user = user;
      ctx.body.jwt = jwtSignDefault(user);
    }
  } else {
    ctx.status = 401;
    ctx.body = {};
  }
});

router.delete("/api/session", async function(ctx, next) {
  ctx.session = null;
  ctx.status = 204;
  ctx.body = {};
});

router.post("/api/session", jwtoptional, async function(ctx, next) {
  const rememberMe = ctx.request.body.rememberMe === true;

  if (!ctx.request.username && !ctx.request.body) {
    ctx.body = { success: false, message: INVALID_USERNAME_OR_PASSWORD };
    ctx.status = 400;
    return;
  }

  const user = await dao.getUserByUsername(
    ctx.request.body.username,
    true /* with password */
  );

  if (!user) {
    ctx.body = { success: false, message: INVALID_USERNAME_OR_PASSWORD };
    ctx.status = 400;
    return;
  }

  // if (ctx.request.body.password === user.password) {
  if (await bcrypt.compareAsync(ctx.request.body.password, user.password)) {
    delete user.password; // dont return the password in the response
    const jwt = jwtSignDefault(user);
    ctx.cookies.set("jwt", jwt, {
      httpOnly: false,
      sign: false,
      expires: rememberMe
        ? moment()
            .add(365, "days")
            .toDate()
        : null // null == session cookie
      // expires: rememberMe ? moment().add(1, 'seconds').toDate() : null // For testing expired cookies
    });
    ctx.response.body = Object.create(null);
    ctx.response.body.user = user;
    ctx.response.body.jwt = jwt;
  } else {
    ctx.body = { success: false, message: INVALID_USERNAME_OR_PASSWORD };
    ctx.status = 400;
  }
});

/****
Events: only admins can acccess.
***/

// r.db('agilegps').table('events').orderBy({index: r.desc('order')})
router.get("/api/events", jwtrequired, mustBeAdmin, async function(ctx, next) {
  const queryPageSize = ctx.query.pagesize || ctx.query.pageSize;
  
  let events;
  if (ctx.query.page && queryPageSize) {
    const page = parseInt(ctx.query.page, 10) - 1;
    const pageSize = parseInt(queryPageSize, 10);
    ctx.body = await r
      .table("vehiclehistory")
      .orderBy({ index: r.desc("id") })
      .slice(page * pageSize, page * pageSize + pageSize, {
        right_bound: "open"
      });
  } else {
    ctx.body = await r.table("vehiclehistory").orderBy({ index: r.desc("id") });
  }
});

router.get("/api/count/events", jwtrequired, mustBeAdmin, async function(
  ctx,
  next
) {
  const count = await r.table("vehiclehistory").count();
  ctx.body = {
    count: count
  };
});

// const MAX_RAW_EVENTS = 20000;
function getRawEvents(search) {
  let events = r.table("rawevents");
  if (search) {
    events = events.getAll(search, { index: "imei" });
    events = events.orderBy(r.desc("date"));
    // events = events.limit(MAX_RAW_EVENTS);
  } else {
    events = events.orderBy({ index: r.desc("date") });
    // events = events.limit(MAX_RAW_EVENTS);
  }
  return events;
}

router.get("/api/rawevents", jwtrequired, mustBeAdmin, async function(
  ctx,
  next
) {
  let search = ctx.query.search;
  let events = getRawEvents(search);
  if (ctx.query.page && ctx.query.pageSize) {
    let page = parseInt(ctx.query.page, 10);
    page = page - 1;
    let pageSize = parseInt(ctx.query.pageSize, 10);
    events = events.slice(page * pageSize, page * pageSize + pageSize, {
      right_bound: "open"
    });
  }
  ctx.body = await events;
});

router.get("/api/count/rawevents", jwtrequired, mustBeAdmin, async function(
  ctx,
  next
) {
  let search = ctx.query.search;
  let events = getRawEvents(search);
  ctx.body = {
    count: await events.count()
  };
});

/****
Exceptions: only admins can acccess.
***/
// r.db('agilegps').table('events').orderBy({index: r.desc('order')})
router.get("/api/exceptions", jwtrequired, mustBeAdmin, async function(
  ctx,
  next
) {
  let events;
  if (ctx.query.page && ctx.query.pagesize) {
    let page = parseInt(ctx.query.page, 10);
    page = page - 1;
    let pagesize = parseInt(ctx.query.pagesize, 10);
    events = await r
      .table("errors")
      .orderBy({ index: r.desc("date") })
      .slice(page * pagesize, page * pagesize + pagesize, {
        right_bound: "open"
      });
  } else {
    events = await r.table("errors").orderBy({ index: r.desc("date") });
  }
  ctx.body = events;
});

router.get("/api/count/exceptions", jwtrequired, mustBeAdmin, async function(
  ctx,
  next
) {
  const count = await r.table("errors").count();
  ctx.body = {
    count: count
  };
});

/****
Organizations, only admin can create/update. Only member can view.
***/
router.get("/api/organizations", jwtrequired, async function(ctx, next) {
  if (ctx.state.user.isAdmin) {
    ctx.body = await dao.getOrganizations();
  } else {
    ctx.body = [await dao.getOrganization(ctx.state.user.orgid)];
  }
});

router.get("/api/organizations/:orgid", jwtrequired, async function(ctx, next) {
  if (ctx.state.user.isAdmin) {
    ctx.body = await dao.getOrganization(ctx.params.orgid);
  } else if (ctx.state.user.orgid === ctx.params.orgid) {
    ctx.body = await dao.getOrganization(ctx.state.user.orgid);
  } else {
    throw new Error("Access Denied");
  }
});

router.delete(
  "/api/organizations/:orgid",
  jwtrequired,
  mustBeAdmin,
  async function(ctx, next) {
    if (ctx.state.user.isAdmin) {
      ctx.body = await dao.deleteOrganization(ctx.params.orgid);
    } else {
      throw new Error("Access Denied");
    }
  }
);

router.post("/api/organizations", jwtrequired, mustBeAdmin, async function(
  ctx,
  next
) {
  ctx.body = await dao.newOrganization(ctx.request.body);
});

router.put(
  "/api/organizations/:orgid",
  jwtrequired,
  mustBeAdmin,
  async function(ctx, next) {
    ctx.body = await dao.updateOrganization(ctx.params.orgid, ctx.request.body);
  }
);

/****

Users are per org. Can be accessed by admin or their orgAdmin.

***/
router.get("/api/organizations/:orgid/users", jwtrequired, async function(
  ctx,
  next
) {
  if (ctx.state.user.isAdmin === true || ctx.state.user.isOrgAdmin === true) {
    ctx.body = await dao.getUsers(ctx.params.orgid);
  } else {
    ctx.body = [
      await dao.getUserByOrgId(ctx.params.orgid, ctx.state.user.username)
    ]; // regular users can only get themselves
  }
});

router.get(
  "/api/organizations/:orgid/users/:id",
  jwtrequired,
  mustBeObjectOwnerOrAdminOrOrgAdmin,
  async function(ctx, next) {
    ctx.body = await dao.getUserByOrgId(ctx.params.orgid, ctx.params.id);
  }
);

router.delete(
  "/api/organizations/:orgid/users/:id",
  jwtrequired,
  mustBeAdminOrOrgAdmin,
  async function(ctx, next) {
    ctx.body = await dao.deleteUser(ctx.params.id, ctx.params.orgid);
  }
);

// id is the username
router.put(
  "/api/organizations/:orgid/users/:id",
  jwtrequired,
  mustBeObjectOwnerOrAdminOrOrgAdmin,
  onlyAdminCanSetAdmin,
  async function(ctx, next) {
    ctx.body = await dao.updateUserByOrgId(
      ctx.params.orgid,
      ctx.params.id,
      ctx.request.body
    );
  }
);

router.get("/api/users", jwtrequired, mustBeAdmin, async function(ctx, next) {
  if (ctx.state.user.isAdmin === true || ctx.state.user.isOrgAdmin === true) {
    ctx.body = await dao.getUsers();
  } else {
    ctx.body = [await dao.getUserByOrgId(null, ctx.state.user.username)]; // regular users can only get themselves
  }
});

router.get("/api/users/:id", jwtrequired, mustBeAdmin, async function(
  ctx,
  next
) {
  ctx.body = await dao.getUser(ctx.params.id);
});

router.delete("/api/users/:id", jwtrequired, mustBeAdmin, async function(
  ctx,
  next
) {
  ctx.body = await dao.deleteUser(ctx.params.id);
});

router.put(
  "/api/users/:id",
  jwtrequired,
  mustBeObjectOwnerOrAdminOrOrgAdmin,
  onlyAdminCanSetAdmin,
  async function(ctx, next) {
    ctx.body = await dao.saveUser(ctx.params.id, ctx.request.body);
  }
);

/****
Reports
***/
router.get(
  "/api/organizations/:orgid/reports/:reportid",
  jwtrequired,
  mustBeAdminOrOrgMember,
  async function(ctx, next) {
    let tzOffset = 0;
    if (ctx.query.tzOffset) {
      tzOffset = Number.parseInt(ctx.query.tzOffset);
    }
    let vehicles;

    if (ctx.query.vehicles) {
      vehicles = JSON.parse(ctx.query.vehicles);
    }

    // if (ctx.query.format === 'excel')

    ctx.body = await reports.getReport(
      ctx.params.orgid,
      ctx.params.reportid,
      vehicles,
      new Date(ctx.query.startDate),
      new Date(ctx.query.endDate),
      tzOffset
    );
  }
);

/****
Devices
***/
router.get(
  "/api/organizations/:orgid/devices",
  jwtrequired,
  mustBeAdminOrOrgMember,
  async function(ctx, next) {
    ctx.body = await dao.getDevices(ctx.params.orgid);
  }
);

router.get(
  "/api/organizations/:orgid/devices/:id",
  jwtrequired,
  mustBeAdminOrOrgMember,
  async function(ctx, next) {
    ctx.body = await dao.getDevice(
      ctx.params.id,
      ctx.state.user.isAdmin,
      ctx.params.orgid
    );
  }
);

router.delete(
  "/api/organizations/:orgid/devices/:id",
  jwtrequired,
  mustBeAdmin,
  async function(ctx, next) {
    ctx.body = await dao.deleteDevice(
      ctx.params.id,
      ctx.state.user.isAdmin,
      ctx.params.orgid
    );
  }
);

// No post for devices since uniquely identified by ID (IMEI)
router.put(
  "/api/organizations/:orgid/devices/:id",
  jwtrequired,
  mustBeAdmin,
  async function(ctx, next) {
    ctx.body = await dao.saveDeviceByOrgID(
      ctx.request.body,
      ctx.params.id,
      ctx.state.user.isAdmin,
      ctx.params.orgid
    );
  }
);

router.get("/api/devices", jwtrequired, mustBeAdmin, async function(ctx, next) {
  ctx.body = await dao.getDevices();
});

router.get("/api/devices/:id", jwtrequired, mustBeAdmin, async function(
  ctx,
  next
) {
  ctx.body = await dao.getDevice(ctx.params.id, ctx.state.user.isAdmin);
});

router.delete("/api/devices/:id", jwtrequired, mustBeAdmin, async function(
  ctx,
  next
) {
  ctx.body = await dao.deleteDevice(ctx.params.id, ctx.state.user.isAdmin);
});

router.put("/api/devices/:id", jwtrequired, mustBeAdmin, async function(
  ctx,
  next
) {
  ctx.body = await dao.saveDevice(ctx.request.body, ctx.params.id);
});

/****
Fleets
***/
router.get(
  "/api/organizations/:orgid/fleets",
  jwtrequired,
  mustBeAdminOrOrgMember,
  async function(ctx, next) {
    ctx.body = await dao.getFleets(ctx.params.orgid);
  }
);

router.get(
  "/api/organizations/:orgid/fleets/:id",
  jwtrequired,
  mustBeAdminOrOrgMember,
  async function(ctx, next) {
    ctx.body = await dao.getFleet(
      ctx.params.id,
      ctx.state.user.isAdmin,
      ctx.params.orgid
    );
  }
);

router.post(
  "/api/organizations/:orgid/fleets",
  jwtrequired,
  mustBeAdmin,
  async function(ctx, next) {
    ctx.body = await dao.newFleet(ctx.request.body, ctx.params.orgid);
  }
);

router.put(
  "/api/organizations/:orgid/fleets/:id",
  jwtrequired,
  mustBeAdmin,
  async function(ctx, next) {
    ctx.body = await dao.updateFleet(
      ctx.request.body,
      ctx.params.id,
      ctx.state.user.isAdmin,
      ctx.params.orgid
    );
  }
);

router.delete(
  "/api/organizations/:orgid/fleets/:id",
  jwtrequired,
  mustBeAdmin,
  async function(ctx, next) {
    ctx.body = await dao.deleteFleet(
      ctx.params.id,
      ctx.state.user.isAdmin,
      ctx.params.orgid
    );
  }
);

/****

Vehicles are per org. Can be accessed by admin or their orgAdmin or their users.

***/
router.get("/api/vehicles", jwtrequired, mustBeAdmin, async function(
  ctx,
  next
) {
  ctx.body = await dao.getVehicles();
});

router.get(
  "/api/organizations/:orgid/vehicles",
  jwtrequired,
  mustBeAdminOrOrgMember,
  async function(ctx, next) {
    ctx.body = await dao.getVehicles(ctx.params.orgid);
  }
);

router.get(
  "/api/organizations/:orgid/vehicles/:id",
  jwtrequired,
  mustBeAdminOrOrgMember,
  async function(ctx, next) {
    ctx.body = await dao.getVehicle(
      ctx.params.orgid,
      ctx.params.id,
      ctx.state.user.isAdmin
    );
  }
);

router.delete(
  "/api/organizations/:orgid/vehicles/:id",
  jwtrequired,
  mustBeAdminOrOrgMember,
  async function(ctx, next) {
    ctx.body = await dao.deleteVehicle(
      ctx.params.orgid,
      ctx.params.id,
      ctx.state.user.isAdmin
    );
  }
);

router.post(
  "/api/organizations/:orgid/vehicles",
  jwtrequired,
  mustBeAdminOrOrgAdmin,
  async function(ctx, next) {
    ctx.body = await dao.newVehicle(ctx.params.orgid, ctx.request.body);
  }
);

router.put(
  "/api/organizations/:orgid/vehicles/:id",
  jwtrequired,
  mustBeAdminOrOrgAdmin,
  async function(ctx, next) {
    ctx.body = await dao.updateVehicle(
      ctx.params.orgid,
      ctx.params.id,
      ctx.request.body,
      ctx.state.user.isAdmin
    );
  }
);

router.get(
  "/api/organizations/:orgid/vehiclehistory/:id",
  jwtoptional,
  jwtcookie,
  mustBeAdminOrOrgMember,
  vehiclehistory
);

// router.post('/api/vehiclehistory/:id/geocode', jwtoptional, jwtcookie, mustBeAdmin, async function (ctx, next) {
// 	const id = ctx.params.id;
// 	const force = ctx.query.force;
// 	const timeout = ctx.query.timeout || null;
// 	const histItem = await r.table('vehiclehistory').get(id);
// 	const address = await reverseGeo(histItem.la, histItem.lo, timeout, force);
// 	histItem.ad = address;
// 	const retVal = await r.table('vehiclehistory').get(id).update(histItem, {returnChanges: 'always'});
// 	ctx.body = retVal.changes[0].new_val;
// })

// last status of all vehicles for an organization
router.get(
  "/api/organizations/:orgid/vehiclestatus",
  jwtoptional,
  jwtcookie,
  mustBeAdminOrOrgMember,
  vehiclestatus
);

router.get(
  "/api/dbjobs",
  jwtrequired,
  mustBeAdmin,
  async ctx => {
    ctx.body = await dao.getDatabaseJobs();
  }
);

router.delete(
  "/api/dbjob/:jobid",
  jwtrequired,
  mustBeAdmin,
  async ctx => {
    ctx.body = await dao.killDatabaseJob(JSON.parse(ctx.params.jobid));
  }
);

router.get(
  "/api/dbstats",
  jwtrequired,
  mustBeAdmin,
  async ctx => {
    ctx.body = await dao.getDatabaseStats();
  }
);
