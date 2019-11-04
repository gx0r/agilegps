/* Copyright (c) 2016 Grant Miner */
"use strict";

const l = {
  // id
  id: "ID",
  imei: "IMEI",
  // orgs
  name: "Name",
  ein: "EIN",
  address1: "Address Line 1",
  address2: "Address Line 2",
  city: "City",
  state: "State",
  zip: "ZIP Code",
  country: "Country",

  // users
  username: "Username",
  password: "Password",
  email: "E-mail",
  firstname: "First Name",
  lastname: "Last Name",
  workphone: "Work Phone Number",
  mobilephone: "Mobile Phone Number",
  fax: "Fax Number",
  isAdmin: "Site Admin",
  isOrgAdmin: "Org Admin",
  advancedMode: "Advanced UI Mode",

  // devices
  sim: "SIM",
  phone: "Phone Number",
  network: "Network Provider (Carrier)",
  active: "Active",
  status: "Status",

  // vehicles
  device: "Link to Device (IMEI)",
  plate: "License Plate",
  vin: "VIN",
  vehicleType: "Type of vehicle (truck, trailer, etc.)",
  odometer: "Odometer",
  installLocation: "Install Location",
  hookedAsset: "Hooked Asset",
  document: "Document",
  seat: "Seat",
  length: "Length",
  width: "Width",
  gvWeight: "GV Weight",
  gcWeight: "GC Weight",
  engineHours: "Engine Hours",
  hazardLevel: "Hazard Level",
  navigationKey: "Navigation Key",
  navigationNumber: "Navigation Number",
  unreadMessagePrompt: "Unread Message Prompt",
  disableHos: "Disable Hos",
  forceMessageReadStatus: "Force Message Read Status",
  enableAssignedDriverIgnition: "Enable Assigned Driver Ignition",
  enableTollFuelTab: "Enable Toll Fuel Tab",
  allowCoDriving: "Allow Co Driving",
  driverLoginEnforced: "Driver Login Enforced",
  enableFuelSensor: "Enable Fuel Sensor",
  axies: "Axies"
};

module.exports = function(key) {
  if (l[key]) return l[key];
  else return key;
};
