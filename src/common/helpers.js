/* Copyright (c) 2016 Grant Miner */
"use strict";
const _ = require("lodash");
const moment = require("moment");
const getStatus = require("./status").getStatus;
const isIdle = require("./status").isIdle;
const isPark = require("./status").isPark;
const isStop = require("./status").isStop;
const isTow = require("./status").isTow;

function getAccuracy(i) {
  // https://en.wikipedia.org/wiki/Dilution_of_precision_(GPS)
  if (!_.isNumber(i)) {
    return null;
  }
  i = Number(i);
  if (i === 0) {
    return "None";
  } else if (i <= 1 && i > 0) {
    return "Ideal";
  } else if (i <= 2) {
    return "Excellent";
  } else if (i <= 5) {
    return "Good";
  } else if (i <= 10) {
    return "Moderate";
  } else if (i <= 20) {
    return "Fair";
  } else {
    return "Poor";
  }
}
module.exports.getAccuracy = getAccuracy;

function getAccuracyAsStars(i) {
  i = Number(i);
  if (i === 0) {
    return "";
  } else if (i <= 1 && i > 0) {
    return "☆☆☆☆☆";
  } else if (i <= 2) {
    return "☆☆☆☆";
  } else if (i <= 5) {
    return "☆☆☆";
  } else if (i <= 10) {
    return "☆☆";
  } else return "☆";
}

module.exports.getAccuracyAsImg = function getAccuracyAsImg(i) {
  if (!_.isNumber(i)) {
    return null;
  }
  i = Number(i);
  if (i === 0) {
    return "/images/signal0.png";
  } else if (i <= 1 && i > 0) {
    return "/images/signal5.png";
  } else if (i <= 2) {
    return "/images/signal4.png";
  } else if (i <= 5) {
    return "/images/signal3.png";
  } else if (i <= 10) {
    return "/images/signal2.png";
  } else if (i <= 20) {
    return "/images/signal1.png";
  } else {
    return "/images/signal0.png";
  }
};

module.exports.getAccuracyAsStars = getAccuracyAsStars;

function toGoogle(history) {
  return {
    lat: history.l.coordinates[1],
    lng: history.l.coordinates[0]
  };
}
module.exports.toGoogle = toGoogle;

function cleanItem(item) {
  if (item.cmd === "TOW") {
    item.ig = false;
    item.mo = true;
  }

  // Low Speed Moving Override
  // e.g., if speed is less than 1km/h, override moving to be false.
  // let lowspeed = 3.5;
  // if (item.s < lowspeed) {
  //     item.mo = false;
  //     item.faketow = false;
  //     if (item.cmd === 'TOW') {
  //         item.cmd = 'FRI';
  //         item.ig = false;
  //     }
  // }
  return item;
}
module.exports.cleanItem = cleanItem;

function cleanData(history) {
  if (!history) {
    return [];
  }

  return history.map(function(item) {
    if (item.last) {
      item.last = cleanItem(item.last);
      return item;
    } else {
      return cleanItem(item);
    }
  });
}
module.exports.cleanData = cleanData;

/**
Non verbose status, e.g. we want to display it on the org view.
*/
function isNotVerbose(item) {
  // return ['BPL', 'BTC', 'CRA', 'EMG', 'EPS', 'FLA',
  // 'FRI', 'GIN', 'GOT', 'GSS', 'HBM', 'IDN', 'IDL', 'IGF', 'IGN',
  // 'JDC', 'JDS', 'LSP', 'MPF', 'MPN', 'PFA', 'PNA', 'SOS', 'SPD',
  // 'STC', 'TMP', 'TOW', 'OPN', 'OPF', 'OWH', 'RTO'
  // ].indexOf(item.cmd) > -1;

  if (item.cmd === "FRI") {
    const status = getStatus(item);
    return !(
      ["Sensor Motion", "Sensor Rest", "Fake Towing", "Towing (FRI)"].indexOf(
        status
      ) > -1
    );
  } else
    return (
      [
        ,
        // , 'BPL'
        // , 'BTC'
        "CRA",
        "EMG",
        // , 'EPS'
        "FLA",
        // , 'FRI'
        "GIN",
        "GOT",
        // , 'GSS'
        "HBM",
        "IDN",
        "IDL",
        "IGF",
        "IGN",
        "JDC",
        "JDS",
        "LSP",
        // , 'MPF'
        // , 'MPN'
        "PFA",
        "PNA",
        "SOS",
        "SPD",
        // , 'STC'
        "TMP",
        "TOW",
        // , 'OPN'
        // , 'OPF'
        "OWH"
        // , 'RTO'
      ].indexOf(item.cmd) > -1
    );
}
module.exports.isNotVerbose = isNotVerbose;

function onlyVisibleHistory(history) {
  if (!history) {
    return [];
  } else {
    return history.filter(isNotVerbose);
  }
}
module.exports.onlyVisibleHistory = onlyVisibleHistory;

function containsMotionInformation(item) {
  if (
    [
      "FRI",
      "TOW",
      "SPD",
      "MPF",
      "MPN",
      "PFA",
      "PNA",
      "IGN",
      "IGF",
      "HBM",
      "RTL"
    ].indexOf(item.cmd) > -1
  ) {
    return true;
  } else {
    return false;
  }
}
module.exports.containsMotionInformation = containsMotionInformation;

// is item a motion event
// towing is not considered
function isMotion(item) {
  if (!containsMotionInformation(item)) {
    throw new Error("Item does not contain motion information");
  }
  if (!isNotVerbose(item)) {
    return false;
  }
  let status = getStatus(item);
  if (isTow(item)) {
    return false;
  }

  if (
    item.cmd === "PFA" ||
    item.cmd === "PNA" ||
    item.cmd === "IGF" ||
    item.cmd === "IGN" ||
    item.cmd === "MPF" ||
    item.cmd === "MPN"
  ) {
    return false;
  }

  if (item.cmd === "FRI" || item.cmd === "TOW" || item.cmd === "SPD") {
    if (isIdle(item)) return false;
    if (isStop(item)) return false;
    if (isPark(item)) return false;
  }
  return true;
  //
  // let ismotion = item != null
  //  && (item.cmd === 'FRI' || item.cmd === 'TOW' || item.cmd === 'SPD' || item.cmd === 'HBM' || item.cmd === 'OBD' || item.cmd === 'BPL')
  //  && !isPark(item) && !isIdle(item) && !isTow(item)
  // return ismotion;
}
module.exports.isMotion = isMotion;

function mileageChange(history) {
  // compute mileage between events and mileage for every event, since some don't report it.
  let i;
  if (!history) {
    return [];
  } else
    return history.reduce(function(output, current, index, array) {
      if (!_.isFinite(array[index].m)) {
        for (i = index; i >= 0; i--) {
          if (_.isFinite(array[i].m)) {
            current.m = array[i].m;
            break;
          }
        }
      }
      if (!_.isFinite(array[index].tm)) {
        for (i = index; i >= 0; i--) {
          if (_.isFinite(array[i].tm)) {
            current.tm = array[i].tm;
            break;
          }
        }
      }

      if (index === 0) {
        // first item
        current.mc = 0; // mileage change; mileage between single events.
      } else {
        let last = output[output.length - 1];
        if (last != null) {
          if (!_.isFinite(current.m)) {
            current.m = last.m;
          }
          current.mc = current.m - last.m;
        }

        // Compute idle/parked times
        if (isIdle(current)) {
          if (last) {
            current.idleTime = moment(current.d).diff(last.d);
          } else {
            current.idleTime = 0;
          }
        }

        if (isPark(current)) {
          if (last) {
            current.idleTime = moment(current.d).diff(last.d);
          } else {
            current.idleTime = 0;
          }
        }
      }

      output.push(current);
      return output;
    }, []);
}
module.exports.mileageChange = mileageChange;

module.exports.ignitionMileage = function ignitionMileage(history) {
  // mileage between ignitions
  if (!history) {
    return [];
  } else
    return history.reduce(function(output, current, index, array) {
      if (index === 0 || current.cmd === "IGF" || current.cmd === "IGN") {
        // first item and ignition changes reset the mileages.
        current.tm = 0; // trip mileage; mileage between ignition events.
      } else {
        let last = output[output.length - 1];
        if (last != null) {
          current.tm = last.tm + current.mc;
        }
      }

      output.push(current);
      return output;
    }, []);
};
module.exports.mileageChange = mileageChange;

function startStopMileage(history) {
  // mileage between starts/stops
  if (!history) {
    return [];
  } else
    return history.reduce(function(output, current, index, array) {
      if (index === 0) {
        current.tm = 0; // trip mileage; mileage between start/stop events.
      }

      if (current.statusOverride === "Start") {
        current.tm = 0;
      } else {
        let last = array[index - 1];
        if (last != null) {
          current.tm = current.mc + last.tm;
        } else {
          current.tm = current.mc;
        }
      }
      output.push(current);
      return output;
    }, []);
}
module.exports.startStopMileage = startStopMileage;

function addStartStop(history) {
  // this operates on an array in time-ascending order
  let started = false;

  if (!history) {
    return [];
  } else
    return history.reduce(function(output, current, index, array) {
      if (started) {
        // if we were moving
        if (containsMotionInformation(current)) {
          if (!isMotion(current)) {
            // and now we are stopped
            started = false;
            let fake = _.clone(current);
            fake.statusOverride = "Stopped";
            fake.id = fake.id + "fakestop";
            fake.mc = 0;
            fake.s = 0;
            fake.tm = output.tm;
            output.push(fake);
          } else {
          }
        } else {
        }
      }

      if (!started) {
        // if we were stopped
        if (containsMotionInformation(current)) {
          if (isMotion(current)) {
            // and now we're moving
            started = true;
            if (current.mc > 0) {
              // if this motion event has a mileage change
              // add a fake start event
              let fake = _.clone(current);
              fake.statusOverride = "Start";
              fake.id = fake.id + "fakestart";
              fake.mc = 0;
              fake.s = 0;
              // if (earlier) {
              //     fake.m = earlier.m;
              // }
              output.push(fake);
            } else {
              // otherwise this starts at a 0 mileage change, we can just make it a start itself, so we don't add a start then a motion with both '0' mileage change.
              current.statusOverride = "Start";
            }
          } else {
          }
        } else {
        }
      }
      output.push(current);

      // let earlier = array[index - 1];
      // let later = array[index + 1];
      // let fake;
      // let pushedCurrentValue = false;
      //
      // if (containsMotionInformation(current) && isMotion(current) && containsMotionInformation(earlier) && !isMotion(earlier)) {
      //
      //     if (current.mc > 0) { // if this motion event has a mileage change
      //         // add a fake start event
      //         fake = _.clone(current);
      //         fake.statusOverride = 'Start';
      //         fake.id = fake.id + 'fakestart';
      //         fake.mc = 0;
      //         fake.s = 0;
      //         if (earlier) {
      //             fake.m = earlier.m;
      //         }
      //         output.push(fake);
      //     } else {
      //         // otherwise this starts at a 0 mileage change, we can just make it a start itself, so we don't add a start then a motion with both '0' mileage change.
      //         current.statusOverride = 'Start';
      //     }
      // }
      //
      // output.push(current);
      //
      // if (index != array.length - 1 && containsMotionInformation(current) && isMotion(current) && containsMotionInformation(later) && !isMotion(later)) { // add a fake stopped event
      //     fake = _.clone(current);
      //     fake.statusOverride = 'Stopped';
      //     fake.id = fake.id + 'fakestop';
      //     fake.mc = 0;
      //     fake.s = 0;
      //     fake.tm = output.tm;
      //     output.push(fake);
      // }
      return output;
    }, []);
}
module.exports.addStartStop = addStartStop;

function rollup(history) {
  let idleStart, parkedStart;

  // this operates on an array in time-ascending order
  if (!history) {
    return [];
  } else
    return history.reduce(function(output, current, index, array) {
      let later = array[index + 1];
      let earlier = array[index - 1];

      if (containsMotionInformation(current) && isIdle(current)) {
        if (idleStart == null) {
          if (earlier != null) {
            idleStart = earlier.d;
          } else {
            idleStart = current.d;
          }
        }

        if (
          later == null ||
          (containsMotionInformation(later) && !isIdle(later))
        ) {
          current.idleTime = moment(current.d).diff(idleStart);
          idleStart = null;
          return output.concat(current);
        } else {
          return output;
        }
      }

      if (containsMotionInformation(current) && isPark(current)) {
        if (parkedStart == null) {
          if (earlier != null) {
            parkedStart = earlier.d;
          } else {
            parkedStart = current.d;
          }
        }

        if (
          later == null ||
          (containsMotionInformation(later) && !isPark(later))
        ) {
          current.idleTime = moment(current.d).diff(parkedStart);
          parkedStart = null;
          return output.concat(current);
        } else {
          return output;
        }
      }

      return output.concat(current);
    }, []);
}
module.exports.rollup = rollup;

function nullToBlank(x) {
  if (x == null || _.isNaN(x)) {
    return "";
  } else {
    return x;
  }
}
module.exports.nullToBlank = nullToBlank;
