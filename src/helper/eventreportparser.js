/* Copyright (c) 2016 Grant Miner */
"use strict";
/*
Command:    AT+GTXXX=<parameter1>,<parameter2>,...$
Acknowledgement:    +ACK:GTXXX,<parameter1>,<parameter2>,...$
Report:   +RESP:GTXXX,<parameter1>,<parameter2>,...$
*/
const datehelper = require("./datehelper");
const _ = require("lodash");
const friendlyCommands = require("./friendlycommands");

function getFriendlyStatus(status) {
  const lookup = "" + status[0] + status[1];
  return friendlyStatus[lookup];
}

const friendlyStatus = {
  // page 128
  "16": "tow",
  "1A": "fake tow",
  "11": "ignition off rest",
  "12": "ignition off motion",
  "21": "ignition on rest",
  "22": "ignition on motion",
  "41": "sensor rest",
  "42": "sensor motion"
};

function parseCount(count) {
  return parseInt(count, 16);
}

function getGpsDate(dateInput) {
  try {
    return datehelper.toDate(dateInput);
  } catch (e) {
    // console.error('bad GPS date ' + dateInput);
    return NaN;
  }
}

module.exports = function(commandString) {
  // const regexp = new RegExp('^\\+(ACK:GT|RESP:GT)(\\w*)(?:,(\\w*))*?(?:\\$$)')
  // const r = /\+(ACK:GT|RESP:GT)(\w*)(?:,(\w*))*?(?:\$)/

  commandString = commandString.toString("ascii").trim();

  const regex = /\+(ACK:GT|RESP:GT|BUFF:GT)(\w{3}),(.*)(?:\$)/;
  const f = regex.exec(commandString);

  const type = f[1];
  const cmd = f[2];
  const args = f[3].split(",");

  let o = Object.create(null); // output object to return.
  o.type = type;

  if (type.startsWith("ACK")) {
    o.shorttype = "ACK";
  } else if (type.startsWith("RESP")) {
    o.shorttype = "RESP";
  } else if (type.startsWith("BUFF")) {
    o.shorttype = "BUFF";
  } else {
    throw new Error("Unknown message type: " + type);
  }

  o.cmd = cmd;
  o.friendly = friendlyCommands[cmd];
  o.args = args;

  const protocolVersion = args[0].substring(0, 2);
  if (protocolVersion == "36" && o.shorttype !== "ACK") {
    // TODO check all protocol versions
    // check for VIN in GV500 messages and then splice it so it matches up with GV300 order of args
    // GV500 has VIN as 3rd argument of RESP messages. (protocol version, unique ID, VIN, device name)
    o.vin = args[2];
    args.splice(2, 1);
  }

  function loadGPSandGSMdata(startingPosition) {
    return loadGSMdata(loadGPSdata(startingPosition));
  }

  // load commonly 11 long block of GPS data & cell data
  function loadGPSdata(startingPosition) {
    let i = startingPosition;
    o.accuracy = Number.parseFloat(args[i++]);
    o.speed = Number.parseFloat(args[i++]);
    o.azimuth = Number.parseFloat(args[i++]);
    o.altitude = Number.parseFloat(args[i++]);
    o.longitude = Number.parseFloat(args[i++]);
    o.latitude = Number.parseFloat(args[i++]);
    o.gpsdate = getGpsDate(args[i++]); // can be NaN

    return i; // returns ending position
  }

  function loadGSMdata(startingPosition) {
    let i = startingPosition;
    o.mcc = args[i++];
    o.mnc = args[i++];
    o.lac = args[i++];
    o.cellid = args[i++];
    i++; // reserved

    return i; // returns ending position
  }

  // load commonly 11 long block of GPS data & cell data
  // function loadGPSdataBackwardFromEnd(startingPosition) {
  //     let i = startingPosition;
  //     o.cellid = args[i--];
  //     o.lac = args[i--];
  //     o.mnc = args[i--];
  //     o.mcc = args[i--];
  //     o.gpsdate = getGpsDate(args[i--]); // can be NaN
  //     o.latitude = Number.parseFloat(args[i--]);
  //     o.longitude = Number.parseFloat(args[i--]);
  //     o.altitude = Number.parseFloat(args[i--]);
  //     o.azimuth = Number.parseFloat(args[i--]);
  //     o.speed = Number.parseFloat(args[i--]);
  //     o.accuracy = Number.parseFloat(args[i--]);
  //     return i; // returns ending position
  // }
  // load OBD data
  function loadOBDdata(startingPosition) {
    function bit(x) {
      return 1 << x;
    }
    let i = startingPosition;
    const obd = Object.create(null);
    o.obd = obd;
    const reportMask = o.reportMask;

    if (reportMask & bit(0)) {
      obd.vin = args[i++];
    }
    if (reportMask & bit(1)) {
      obd.connect = args[i++] === "1";
    }
    if (reportMask & bit(2)) {
      obd.powermV = Number.parseInt(args[i++]);
    }
    if (reportMask & bit(3)) {
      obd.supportPIDs = args[i++];
    }
    if (reportMask & bit(4)) {
      obd.RPMs = Number.parseInt(args[i++]);
    }
    if (reportMask & bit(5)) {
      obd.speed = Number.parseInt(args[i++]);
    }
    if (reportMask & bit(6)) {
      obd.temp = Number.parseInt(args[i++]);
    }
    if (reportMask & bit(7)) {
      obd.fuelConsumption = Number.parseFloat(args[i]);
      if (args[i] === "inf") obd.fuelConsumption = Infinity;
      i++;
    }
    if (reportMask & bit(8))
      obd.DTCsClearedDistanceOverVehicleTotalMileage = Number.parseFloat(
        args[i++]
      );

    if (reportMask & bit(9))
      obd.malfunctionActivatedDistance = Number.parseFloat(args[i++]);

    if (reportMask & bit(10)) obd.malfunction = args[i++] === "1";

    if (reportMask & bit(11)) {
      // console.log("DTC: " + args[i]);
      obd.diagnosticTroubleCodesCount = Number.parseInt(args[i++]);
    }

    obd.diagnosticTroubleCodes = [];

    if (Number.parseInt(o.version) >= 360303) {
      // So far I have seen versions '360303' and '360402'.
      if (reportMask & bit(12)) {
        const codes = args[i];
        obd.diagnosticTroubleCodes = codes.match(/.{1,4}/g);
        i++;
      }
    } else {
      if (reportMask & bit(12)) {
        let codeCount = obd.diagnosticTroubleCodesCount;
        if (_.isNaN(codeCount)) {
          codeCount = 0;
          i++;
        } else {
          // console.log("# of DTCs: " + codeCount);
          if (codeCount > 0) {
            for (let j = 0; j < codeCount; j++, i++) {
              if (args[i] && args[i] !== "") {
                const str = new String(args[i]);
                if (str.length === 4) {
                  obd.diagnosticTroubleCodes.push(args[i]);
                } else {
                  console.error(
                    "Error parsing OBD codes, count: " +
                      codeCount +
                      " " +
                      args[i] +
                      " " +
                      JSON.stringify(obd.diagnosticTroubleCodes)
                  );
                  break;
                }
              }
            }
          } else {
            i += codeCount + 1;
          }
        }
      }
    }

    if (reportMask & bit(13)) obd.throttlePosition = Number.parseInt(args[i++]);
    if (reportMask & bit(14)) obd.engineLoad = Number.parseInt(args[i++]);
    if (reportMask & bit(15)) obd.fuelLevelInput = Number.parseInt(args[i++]);
    if (reportMask & bit(19))
      // OBD Mileage
      obd.mileage = Number.parseFloat(args[i++]);

    if (reportMask & bit(20))
      // GPS info
      i = loadGPSdata(args.length - 15);

    if (reportMask & bit(21))
      // GSM info
      i = loadGSMdata(args.length - 8);

    if (reportMask & bit(22)) {
      // total mileage
      o.mileage = Number.parseFloat(args[args.length - 3]);
    }

    console.log(JSON.stringify(obd, null, 2));

    // start of OBD weirdness.. seems an extra field comes in...messages not matching documentation
    // if (obd.diagnosticTroubleCodesCount > 0)
    // 	// i += obd.diagnosticTroubleCodesCount + 1;
    //     i += obd.diagnosticTroubleCodesCount - 1;
    // else {
    // 	i++
    // }
    // end weirdness

    return i; // returns ending position
  }
  function loadReportIDandType(item) {
    o.rid = item[0]; // report ID
    o.rty = item[1]; // report Type
  }

  const length = args.length;
  o.version = args[0]; // protocol version
  o.imei = args[1];
  o.name = args[2];
  o.count = parseCount(args[length - 1]); // count is always the last argument
  o.senddate = datehelper.toDate(args[length - 2]); // senddate is always the 2nd to last argument

  if (o.shorttype === "ACK") {
    // TODO special handling for ACK, right now we just save it on the device
  } else if (cmd === "OBD") {
    // OBD2 data
    o.rty = args[3]; // report Type. 0 = periodic, 1 = GTORR requested
    o.reportMask = Number.parseInt(args[4], 16);
    o.obd = Object.create(null);
    let i = loadOBDdata(5);
    // i = loadGPSdata(i) // 23 through 33
    // i++; // reserved
    // loadGPSdataBackwardFromEnd(args.length - 5);
    // o.mileage = Number.parseFloat(args[args.length - 3]);
  } else if (cmd === "OSM") {
    // OBD2 data
    o.rid = args[3];
    o.rty = args[4]; // report Type. 0 = periodic, 1 = GTORR requested
    o.reportMask = Number.parseInt(args[5], 16);
    let i = loadOBDdata(6);
    // loadGPSdataBackwardFromEnd(args.length - 5);
    // i = loadGPSdata(i); // 23 through 33
    // i++; // reserved
    // args[34] reserved
    // o.mileage = Number.parseFloat(args[args.length - 3]);
  } else if (_.includes(["PNA", "PFA", "PDP", "HBD", "STC"], cmd)) {
    // handled by above.
  } else if (_.includes(["MPN", "MPF", "BTC", "JDR"], cmd)) {
    // main power on, main power off, battery starts charging
    let i = loadGPSandGSMdata(3); // 3 through 13
    // args[14] reserved
  } else if (
    _.includes(
      ["TOW", "DIS", "IOB", "SPD", "SOS", "RTL", "DOG", "IGL", "HBM"],
      cmd
    )
  ) {
    // 3.3.1. Position Related Report
    // args[3] is reserved
    loadReportIDandType(args[4]);
    o.number = args[5];
    let i = loadGPSandGSMdata(6); // 6 through 17
    o.mileage = Number.parseFloat(args[18]);
  } else if (cmd === "FRI") {
    // fixed report
    o.powervcc = args[3];
    loadReportIDandType(args[4]);
    o.number = args[5];
    let i = loadGPSandGSMdata(6); // 6 through 17
    o.mileage = Number.parseFloat(args[18]);
    o.hourmeter = args[19];
    if (protocolVersion == "FE") { // GV50
      o.batteryPercent = Number.parseFloat(args[20]);
      o.status = args[21];
      // args[24] reserved
      // args[25] reserved
      // args[26] reserved  
    } else {
      o.ain1 = args[20];
      o.ain2 = args[21];
      o.batteryPercent = Number.parseFloat(args[22]);
      o.status = args[23];
      // args[24] reserved
      // args[25] reserved
      // args[26] reserved  
    }
  } else if (cmd === "STT") {
    //
    loadReportIDandType(args[3]);
    let i = loadGPSandGSMdata(4); // 4 through 15
  } else if (cmd === "IGN" || cmd === "IGF") {
    // ignition on, ignition off
    if (cmd === "IGN") {
      o.ignitionDuration = Number.parseFloat(args[3]);
    }
    if (cmd === "IGF") {
      o.ignitionDuration = Number.parseFloat(args[3]);
    }
    let i = loadGPSandGSMdata(4); // 4 through 15
    o.hourmeter = args[16];
    o.mileage = Number.parseFloat(args[17]);
  } else if (_.includes(["STR", "STP", "LSP"], cmd)) {
    // start / stop etc page 234
    // args[3] reserved
    // args[4] reserved
    let i = loadGPSandGSMdata(5); // 5 through 16
    o.mileage = Number.parseFloat(args[17]);
  } else if (cmd === "EPS") {
    // POWER low alarm, page 131
    o.externalPower = args[3]; // 0-32000mV / 0-16000mV
    o.inputVcc = args[4];
    loadReportIDandType(args[5]);
    o.number = args[6];

    // TODO I think this may be wrong in the manual. accuracy looks more like speed, here.
    // o.accuracy = Number.parseFloat(args[7]);
    o.speed = Number.parseFloat(args[7]);
    o.azimuth = Number.parseFloat(args[8]);
    o.altitude = Number.parseFloat(args[9]);
    o.longitude = Number.parseFloat(args[10]);
    o.latitude = Number.parseFloat(args[11]);
    // o.gpsdate = datehelper.toDate(args[12]);
    o.gpsdate = getGpsDate(args[12]);
    o.mcc = args[13];
    o.mnc = args[14];
    o.lac = args[15];
    o.cellid = args[16];
    // args[17] reserved
    o.mileage = Number.parseFloat(args[18]);
  } else if (cmd === "GSS") {
    // gps signal lost, page 233
    o.gpsSignalStatus = args[3]; // 0-1
    o.satelliteNumber = args[4]; // 0-24
    o.deviceState = args[5];
    // args[6]; // reserved
    let i = loadGPSandGSMdata(7); // 7 through 18
  } else if (cmd === "OPN" || cmd === "OPF") {
    //gv500 OBDC 2
    let i = loadGPSandGSMdata(3); // 3 through 14
  } else if (cmd === "INF") {
    //todo
    o.version = args[0]; // protocol version
    o.imei = args[1];
    o.senddate = datehelper.toDate(args[23]);
    o.count = parseCount(args[24]);
  } else if (cmd === "GSM") {
    //TODO
    // o.version = args[0]; // protocol version
    // o.imei = args[1];
    o.fixtype = args[2];
    o.mcc1 = args[3];
    o.mnc1 = args[4];
    o.lac1 = args[5];
    o.cellid1 = args[6];
    // o.senddate = datehelper.toDate(args[45]);
    // o.count = parseCount(args[46]);
  } else if (cmd === "JES") {
    o.jes = Object.create(null);
    let jes = o.jes;
    jes.reportMask = Number.parseInt(args[3], 16);
    jes.journeyConsumption = Number.parseInt(args[4]);
    jes.maxRPM = Number.parseInt(args[5]);
    jes.averageRPM = Number.parseInt(args[6]);
    jes.maxThrottlePosition = Number.parseInt(args[7]);
    jes.averageThrottlePosition = Number.parseInt(args[8]);
    jes.maxEngineLoad = Number.parseInt(args[9]);
    jes.averageEngineLoad = Number.parseInt(args[10]);
    loadGPSdata(11);
    o.mileage = Number.parseFloat(args[23]);
  } else {
    console.error("Unknown Command: " + commandString);
  }

  if (o.status) {
    o.friendlyStatus = getFriendlyStatus(o.status);
  }

  return o;
};
