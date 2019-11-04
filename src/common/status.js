/* Copyright (c) 2016 Grant Miner */
"use strict";
const friendlyCommands = require("../helper/friendlycommands.js");
const moment = require("moment");

function getStatus(item, ignoreOverride) {
  if (!item) {
    return "";
  }
  const cmd = item.cmd;
  if (cmd == null) {
    return "";
  }

  if (ignoreOverride !== true && item.statusOverride != null) {
    return item.statusOverride; // allow creating start, stopped, etc.
  }

  if (cmd === "FRI") {
    if (item.faketow === true) {
      return "Fake Towing";
    }
    if (item.ig == null || item.ig === "?") {
      if (item.mo) {
        return "Sensor Motion";
      } else {
        return "Sensor Rest";
      }
    }

    if (item.ig && !item.mo) {
      if (item.mc > 0) {
        return "Moving";
      } else {
        return "Idling";
      }
    }
    if (item.ig && item.mo) {
      return "Moving";
    }
    if (!item.ig && item.mo) {
      return "Towing (FRI)"; // We only display Towing Alarm as "Towing".
    }
    if (!item.ig && !item.mo) {
      return "Parked";
    }
    return "Unknown FRI";
  } else if (cmd === "GSS") {
    if (item.gss) {
      return "GPS seeing " + item.satelliteNumber + " satellites";
    } else {
      return "GPS lost";
    }
  } else {
    if (cmd === "IGN") {
      // ignition on
      // return friendlyCommands[cmd] + ' after ' +  moment.duration(item.igd, 'seconds').humanize() + ' off';
      // return 'Ignition off for ' +  moment.duration(item.igd, 'seconds').humanize();
      // return 'Ignition on ' +  moment.duration(-item.igd, 'seconds').humanize(true);
      // return 'Ignition on; was off ' + moment.duration(-item.igd, 'seconds').humanize();
      return "Ign on";
    }
    if (cmd === "IGF") {
      // return friendlyCommands[cmd] + ' after ' + moment.duration(item.igd, 'seconds').humanize() + ' on';
      // return 'Ignition off; was on ' +  moment.duration(item.igd, 'seconds').humanize();
      // return 'Ignition off ' +  moment.duration(-item.igd, 'seconds').humanize(true);
      return "Ign off";
    }
    if (cmd === "HBM") {
      if (item.rid == null || item.rty == null) {
        return "Harsh behavior";
      }

      let speed;
      if (item.rid == "3") {
        speed = "high";
      } else if (item.rid == "2") {
        speed = "medium";
      } else if (item.rid == "1") {
        speed = "low";
      } else {
        speed = "unknown";
      }

      return (
        "Harsh " +
        (item.rty == "1" ? "accel" : "brake") +
        " (" +
        speed +
        " speed)"
      );
    }

    if (cmd == "DOG") {
      if (!item.rty) {
        return friendlyCommands[cmd];
      }

      let type = item.rty;
      if (type == 1) return "Watchdog reboot (timed)";
      if (type == 2) return "Watchdog reboot (ign on)";
      if (type == 3) return "Watchdog reboot (input triggered)";
      if (type == 4) return "Watchdog reboot (GSM)";
      if (type == 5) return "Watchdog reboot (GPRS)";
      else return "Watchdog reboot";
    }

    if (friendlyCommands[cmd]) {
      return friendlyCommands[cmd];
    } else {
      return cmd;
    }
    // if (cmd === 'IGF') {
    //     return 'Ign off'
    // } else if (cmd === 'STR') {
    //     return 'Start'
    // } else if (cmd === 'STP') {
    //     return 'Stop'
    // } else if (cmd === 'DOG') {
    //     return 'Dog'
    // } else {
    //     return cmd;
    // }
  }
}
module.exports.getStatus = getStatus;

function isIdle(item) {
  return item != null && getStatus(item) === "Idling";
}
module.exports.isIdle = isIdle;

function isPark(item) {
  return item != null && getStatus(item) === "Parked";
}
module.exports.isPark = isPark;

function isStop(item) {
  return (
    item != null &&
    (item.statusOverride === "Stopped" || getStatus(item) === "Stopped")
  );
}
module.exports.isStop = isStop;

function isStart(item) {
  return (
    item != null &&
    (item.statusOverride === "Start" || getStatus(item) === "Start")
  );
}
module.exports.isStart = isStart;

function isTow(item) {
  return item != null && getStatus(item) === "Towing";
}
module.exports.isTow = isTow;

function isMoving(item) {
  return item != null && getStatus(item) === "Moving";
}
module.exports.isMoving = isMoving;

function isSpeeding(item) {
  return item != null && getStatus(item) === "Speeding";
}
module.exports.isSpeeding = isSpeeding;

function isHarsh(item) {
  return item != null && item.cmd === "HBM";
}
module.exports.isHarsh = isHarsh;

function isStationaryStatus(item) {
  let s = getStatus(item);
  return s.indexOf("Idling") > -1 || s.indexOf("Parked") > -1;
}
module.exports.isStationaryStatus = isStationaryStatus;

function getStatusColor(item) {
  let status = getStatus(item);

  if (isTow(item)) {
    return "orange";
  }
  if (isMoving(item) || isStart(item)) {
    return "green";
  }
  if (isStop(item)) {
    return "red";
  }
  if (isIdle(item)) {
    return " rgb(230, 165, 80)";
  }
  if (isSpeeding(item) || isHarsh(item)) {
    return "#ff06df";
  }
  return "";
}
module.exports.getStatusColor = getStatusColor;

function getMarkerIconFleetView(item) {
  if (isStop(item)) {
    return "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
  }
  if (isStart(item)) {
    return "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
  }
  if (isMoving(item)) {
    return "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
  }

  if (isTow(item)) {
    return "http://maps.google.com/mapfiles/ms/icons/orange-dot.png";
  }

  if (isIdle(item)) {
    return "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
  }
  if (isSpeeding(item)) {
    return "http://maps.google.com/mapfiles/ms/icons/pink-dot.png";
  }

  return "http://maps.google.com/mapfiles/ms/icons/blue-dot.png";
}
module.exports.getMarkerIconFleetView = getMarkerIconFleetView;

function getMarkerIconIndividualHistory(item) {
  if (isStop(item)) {
    return "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
  }
  if (isStart(item)) {
    return "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
  }
  if (isMoving(item)) {
    return null; // no markers for moving
  }

  if (isTow(item)) {
    return null; // no markers for towing
  }

  if (isIdle(item)) {
    return "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
  }

  if (isSpeeding(item)) {
    return "http://maps.google.com/mapfiles/ms/icons/pink-dot.png";
  }

  // return 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
  return null;
}
module.exports.getMarkerIconIndividualHistory = getMarkerIconIndividualHistory;
