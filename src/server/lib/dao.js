/* Copyright (c) 2016 Grant Miner */
"use strict";
const Promise = require("bluebird");
const _ = require("lodash");
const path = require("path");
const r = require("../../common/db");
const systemdb = require("../../common/systemdb").db;

const isHashed = require("./password").isHashed;
const hash = require("./password").hash;

module.exports.getUserByID = async function getUserByID(id) {
  return await r.table("users").get(id);
};

/**
 * organizations
 */

module.exports.getOrganizations = async function getOrganizations() {
  return await r.table("organizations").orderBy("name");
};

module.exports.getOrganization = async function getOrganization(id) {
  return await r.table("organizations").get(id);
};

module.exports.updateOrganization = async function updateOrganization(
  id,
  body
) {
  let x = await r
    .table("organizations")
    .get(id)
    .update(body, { returnChanges: "always" });
  return x.changes[0].new_val;
};

module.exports.newOrganization = async function newOrganization(body) {
  delete body.id;
  let x = await r
    .table("organizations")
    .insert(body, { returnChanges: "always" });
  return x.changes[0].new_val;
};

module.exports.deleteOrganization = async function deleteOrganization(id) {
  let org = await r.table("organizations").get(id);

  let vehicles = await getVehicles(id);

  if (vehicles.length > 0) {
    throw new Error("Organization contains vehicles; refusing to delete.");
  }

  let users = await getVehicles(id);

  if (users.length > 0) {
    throw new Error("Organization contains users; refusing to delete.");
  }

  await r
    .table("fleets")
    .filter({ orgid: id })
    .delete();
  await r
    .table("organizations")
    .get(id)
    .delete();
  return {};
};
/**
 * Users
 */

module.exports.getUsers = async function getUsers(orgid) {
  let query = r.table("users").orderBy("username");
  if (orgid != null) {
    query = query.filter({
      orgid: orgid
    });
  }
  return await query;
};

module.exports.getUserByOrgId = async function getUserByOrgId(orgid, id) {
  const user = await r.table("users").get(id);
  if (user.orgid !== orgid) {
    throw new Error("orgid mismatch");
  } else {
    return user;
  }
};
module.exports.getUser = async function getUser(id) {
  return await r.table("users").get(id);
};

module.exports.deleteUser = async function deleteUser(id) {
  await r
    .table("users")
    .get(id)
    .delete();
  return {};
};

module.exports.saveUser = async function saveUser(id, body) {
  const user = await r.table("users").get(id);

  if (!isHashed(body.password)) {
    let hashed = await hash(body.password);
    body.password = hashed;
  }

  let x;
  if (user) {
    x = await r
      .table("users")
      .get(id)
      .update(body, { returnChanges: "always" });
  } else {
    x = await r.table("users").insert(body, { returnChanges: "always" });
  }

  return x.changes[0].new_val;
};

module.exports.updateUserByOrgId = async function updateUserByOrgId(
  orgid,
  id,
  body
) {
  const user = await r.table("users").get(id);
  if (user.orgid !== orgid) {
    throw new Error("orgid mismatch");
  } else {
    return await saveUser(id, body);
    // if (!isHashed(body.password)) {
    // 	let hashed = await hash(body.password);
    // 	body.password = hashed;
    // }
    //
    // let x = await r.table('users').get(id).update(body, {returnChanges: 'always'});
    // return x.changes[0].new_val;
  }
};

module.exports.getUserByUsername = async function getUserByUsername(
  username,
  withPassword
) {
  if (withPassword) {
    let user = await r.table("users").filter({ username: username });
    return user[0];
  } else {
    let user = await r
      .table("users")
      .without("password")
      .filter({ username: username });
    return user[0];
  }
};

/**
 * Devices
 */

module.exports.getDevices = async function getDevices(orgid) {
  let query = r.table("devices").orderBy("id");
  if (orgid != null) {
    query = query.filter({
      orgid: orgid
    });
  }
  return await query;
};

module.exports.getDevice = async function getDevice(id, isAdmin, orgid) {
  const device = await r.table("devices").get(id);
  if (!isAdmin && device.orgid !== orgid) {
    throw new Error("orgid mismatch");
  } else {
    return device;
  }
};

module.exports.deleteDevice = async function deleteDevice(id, isAdmin, orgid) {
  const device = await r.table("devices").get(id);
  if (!isAdmin && device.orgid !== orgid) {
    throw new Error("orgid mismatch");
  }

  // remove device ID from existing vehicles
  await r
    .table("vehicles")
    .getAll("1", { index: "device" })
    .update({ device: null });

  // delete device itself
  await r
    .table("devices")
    .get(id)
    .delete();
  return {};
};

module.exports.saveDevice = async function saveDevice(body, id) {
  const device = await r.table("devices").get(id);

  let x;
  if (device) {
    x = await r
      .table("devices")
      .get(id)
      .update(body, { returnChanges: "always" });
  } else {
    x = await r.table("devices").insert(body, { returnChanges: "always" });
  }
  return x.changes[0].new_val;
};

module.exports.saveDeviceByOrgID = async function saveDeviceByOrgID(
  body,
  id,
  isAdmin,
  orgid
) {
  const device = await r.table("devices").get(id);
  if (!isAdmin && device.orgid !== orgid) {
    throw new Error("orgid mismatch");
  } else {
    return await saveDevice(body, id);
  }
};

// module.exports.newDevice = async function newDevice (body, orgid) {
// 	if (orgid != null && orgid !== body.orgid) {
// 		throw new Error('orgid mismatch; expected ' + orgid + ', got ' + body.orgid);
// 	}
//
// 	let x = await r.table('devices').insert(body, {returnChanges: 'always'});
// 	return x.changes[0].new_val;
// });

/**
 * Fleets
 */

module.exports.getFleets = async function getFleets(orgid) {
  let query = r.table("fleets").orderBy("name");
  if (orgid != null) {
    query = query.filter({
      orgid: orgid
    });
  }
  return await query;
};

module.exports.getFleet = async function getFleet(id, isAdmin, orgid) {
  const fleet = await r.table("fleets").get(id);
  if (!isAdmin && device.orgid !== orgid) {
    throw new Error("orgid mismatch");
  } else {
    return fleet;
  }
};

module.exports.newFleet = async function newFleet(body, orgid) {
  delete body.id;
  if (orgid != null && orgid !== body.orgid) {
    throw new Error(
      "orgid mismatch; expected " + orgid + ", got " + body.orgid
    );
  }
  let x = await r.table("fleets").insert(body, { returnChanges: "always" });
  return x.changes[0].new_val;
};

module.exports.updateFleet = async function updateFleet(
  body,
  id,
  isAdmin,
  orgid
) {
  const fleet = await r.table("fleets").get(id);
  if (!isAdmin && fleet.orgid !== orgid) {
    throw new Error("orgid mismatch");
  } else {
    let x = await r
      .table("fleets")
      .get(id)
      .update(body, { returnChanges: "always" });
    return x.changes[0].new_val;
  }
};

module.exports.deleteFleet = async function deleteFleet(id, isAdmin, orgid) {
  const fleet = await r.table("fleets").get(id);
  if (!isAdmin && fleet.orgid !== orgid) {
    throw new Error("orgid mismatch");
  } else {
    await r
      .table("fleets")
      .get(id)
      .delete();
    return {};
  }
};

/**
 * Vehicles
 */

const getVehicles = async function getVehicles(orgid) {
  let query = r.table("vehicles").orderBy("name");
  if (orgid != null) {
    query = query.filter({ orgid: orgid });
  }
  return await query;
};
module.exports.getVehicles = getVehicles;

async function getVehicle(orgid, id, isAdmin) {
  const vehicle = await r.table("vehicles").get(id);
  if (!isAdmin && vehicle.orgid !== orgid) {
    throw new Error(
      "orgid mismatch; expected " + vehicle.orgid + ", got " + orgid
    );
  } else {
    return vehicle;
  }
}
module.exports.getVehicle = getVehicle;

module.exports.deleteVehicle = async function deleteVehicle(
  orgid,
  id,
  isAdmin
) {
  const vehicle = await r.table("vehicles").get(id);
  if (!isAdmin && vehicle.orgid !== orgid) {
    throw new Error(
      "orgid mismatch; expected " + vehicle.orgid + ", got " + orgid
    );
  }

  // delete vehicle history
  await r
    .table("vehiclehistory")
    .getAll(id, { index: "vid" })
    .delete();

  // update fleets
  await r.table("fleets").update(function(row) {
    return {
      vehicles: row("vehicles").filter(function(vehicle) {
        return vehicle.ne(id);
      })
    };
  });

  // delete vehicle itself
  await r
    .table("vehicles")
    .get(id)
    .delete();
  return {};
};

const throwIfIMEIUsed = async function(imei, id) {
  if (imei == null || imei == "") return;
  let x = await r.table("vehicles").filter({ device: imei });
  if (x.length > 1) {
    throw new Error("A vehicle is already using IMEI: " + imei);
  } else if (x.length === 1) {
    let otherVehicle = x[0];
    if (id === otherVehicle.id) {
      return;
    }
  }
};

module.exports.updateVehicle = async function updateVehicle(
  orgid,
  id,
  body,
  isAdmin
) {
  const vehicle = await r.table("vehicles").get(id);
  await throwIfIMEIUsed(body.device, id);
  if (body.imei == null) body.imei = "";

  if (!isAdmin && vehicle.orgid !== orgid) {
    throw new Error(
      "orgid mismatch; expected " + vehicle.orgid + ", got " + orgid
    );
  } else {
    let x = await r
      .table("vehicles")
      .get(id)
      .update(body, { returnChanges: "always" });
    return x.changes[0].new_val;
  }
};

module.exports.newVehicle = async function newVehicle(orgid, body) {
  delete body.id;
  await throwIfIMEIUsed(body.device);
  if (body.imei == null) body.imei = "";

  if (orgid !== body.orgid) {
    throw new Error("orgid mismatch");
  }
  let x = await r.table("vehicles").insert(body, { returnChanges: "always" });
  return x.changes[0].new_val;
};

async function getVehicleHistory(orgid, id, startDate, endDate) {
  const vehicle = await getVehicle(orgid, id);
  if (vehicle.orgid !== orgid) {
    throw new Error("orgid mismatch");
  }
  let history = await r
    .table("vehiclehistory")
    .between(startDate, endDate, {
      index: "d",
      leftBound: "closed",
      rightBound: "open"
    })
    // .getAll(id, {index: 'vid'})
    .filter({ vid: id })
    // .filter(r.row('d').during(r.ISO8601(startDate.toISOString()), r.ISO8601(endDate.toISOString()), {leftBound: "open", rightBound: "closed"}))
    .orderBy("id");

  return history;
}
module.exports.getVehicleHistory = getVehicleHistory;

/*
---
0. Initial setup

r.db('agilegps').table('vehicles').orderBy('name').filter({orgid: 'default'})
join with
r.db('agilegps').table('vehiclehistory').filter({vid: 'Generated Vehicle 861074021378065'}).orderBy(r.desc('d')).limit(1)

---
1. Basic Join:

r.db('agilegps').table('vehiclehistory').eqJoin('vid', r.db('agilegps').table('vehicles'))

---

2. Filtered Join:

r.db('agilegps').table('vehicles').orderBy('name').filter({orgid: 'default'})

3rd attempt

r.db('agilegps').table('vehicles').orderBy('name').filter({orgid: 'default'})
  .merge(function (vehicle) {
    return r.db('agilegps').table('vehiclehistory').filter({vid: vehicle.id}).orderBy(r.desc('d')).limit(1)
  })

4th attempt

r.db('agilegps').table('vehicles').orderBy('name').filter({orgid: 'default'})
  .merge(function (vehicle) {
    return r.db('agilegps').table('vehiclehistory').getAll('Generated Vehicle 861074021378065', {index:'vid'}).orderBy(r.desc('d')).limit(1).coerceTo('array')
  })

5th attempt:

r.db('agilegps').table('vehicles').orderBy('name').filter({orgid: 'default'})
  .merge(function (vehicle) {
    return {
      last: r.db('agilegps').table('vehiclehistory').getAll('Generated Vehicle 861074021378065', {index:'vid'}).orderBy(r.desc('d')).limit(1).coerceTo('array')
    }
  })

6th attempt:

r.db('agilegps').table('vehicles').orderBy('name').filter({orgid: 'default'}).limit(3)
  .merge(function (vehicle) {
    return {
      last: r.db('agilegps').table('vehiclehistory').getAll(vehicle('id'), {index:'vid'}).orderBy(r.desc('d')).limit(1).coerceTo('array')
    }
  })


*/
// export async function getAllVehicleStatus (orgid) {
// 	return r.table('vehicles').orderBy('name').filter({orgid: orgid})
// 	// .limit(150)
// 	// .merge(function (vehicle) {
// 	// 	return {
// 	// 		last: r.table('vehiclehistory')
// 	// 		.getAll(vehicle('id'), {index:'vid'})
// 	// 		.orderBy(r.desc('id'))
// 	// 		.limit(1)
// 	// 		.coerceTo('array')
// 	// 		.nth(0)
// 	// 		.default({})
// 	// 	}
// 	// })
// }


async function getDatabaseJobs() {
  // const jobs = await systemdb.table("jobs").orderBy(r.desc('duration_sec'));
  const jobs = await systemdb.table("jobs").orderBy('duration_sec');
  return jobs;
}
module.exports.getDatabaseJobs = getDatabaseJobs;

async function killDatabaseJob(id) {
  const job = await systemdb.table("jobs").get(id).delete();
  return job;
}
module.exports.killDatabaseJob = killDatabaseJob;

async function getDatabaseStats() {
  const stats = await systemdb.table("stats");
  return stats;
}
module.exports.getDatabaseStats = getDatabaseStats;
