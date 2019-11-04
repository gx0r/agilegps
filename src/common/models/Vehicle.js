/* Copyright (c) 2016 Grant Miner */
"use strict";
let v = require("validator");
let _ = require("lodash");

let Vehicle = function(data) {
  if (data == null) {
    data = {
      name: "",
      plate: "",
      vin: "",
      device: "",
      orgid: "",
      state: "",
      vehicleType: "",
      odometer: "",
      engineHours: "",
      installLocation: "",
      hookedAsset: "",
      document: "",
      seat: "",
      length: "",
      width: "",
      height: "",
      gvWeight: "",
      gcWeight: "",
      axies: "",
      hazardLevel: "",
      navigationKey: "",
      navigationNumber: "",
      unreadMessagePrompt: "",
      disableHos: false,
      forceMessageReadStatus: false,
      enableAssignedDriverIgnition: false,
      enableTollFuelTab: false,
      allowCoDriving: false,
      driverLoginEnforced: false,
      enableFuelSensor: false
    };
  }

  _.assign(this, data);

  this.id = v.toString(data.id);
  this.name = data.name;
  this.device = data.device;
  this.orgid = data.orgid;
  this.plate = v.toString(data.plate);
  this.vin = v.toString(data.vin);
  this.state = v.toString(data.state);
  this.vehicleType = v.toString(data.vehicleType);
  this.odometer = v.toFloat(data.odometer);
  this.engineHours = v.toFloat(data.engineHours);
  this.installLocation = v.toString(data.installLocation);
  this.hookedAsset = v.toString(data.hookedAsset);
  this.document = v.toString(data.document);
  this.seat = v.toString(data.seat);
  this.length = v.toFloat(data.length);
  this.width = v.toFloat(data.width);
  this.height = v.toFloat(data.height);
  this.gvWeight = v.toFloat(data.gvWeight);
  this.gcWeight = v.toFloat(data.gcWeight);
  this.axies = v.toFloat(data.axies);
  this.hazardLevel = v.toBoolean(data.hazardLevel);
  this.navigationKey = v.toBoolean(data.navigationKey);
  this.navigationNumber = v.toBoolean(data.navigationNumber);
  this.unreadMessagePrompt = v.toBoolean(data.unreadMessagePrompt);
  this.disableHos = v.toBoolean(data.disableHos);
  this.forceMessageReadStatus = v.toBoolean(data.forceMessageReadStatus);
  this.enableAssignedDriverIgnition = v.toBoolean(data.forceMessageReadStatus);
  this.enableTollFuelTab = v.toBoolean(data.enableTollFuelTab);
  this.allowCoDriving = v.toBoolean(data.allowCoDriving);
  this.driverLoginEnforced = v.toBoolean(data.driverLoginEnforced);
  this.enableFuelSensor = v.toBoolean(data.enableFuelSensor);
};

module.exports = Vehicle;
