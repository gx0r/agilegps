
export function selectHistoryItemID(id) {
  return {
    type: "SET_HISTORY_ITEM_ID",
    value: id
  };
}

export function selectDays(startDate, endDate) {
  return {
    type: "SELECT_DAYS",
    startDate: startDate,
    endDate: endDate
  }
};

export function setShowVerbose(bool) {
  return {
    type: "SHOWVERBOSE",
    value: bool
  };
};

export function setShowLatLong(bool) {
  return {
    type: "SHOWLATLONG",
    value: bool
  };
};

export function selectFleetAll() {
  return {
    type: "SELECT_FLEET_ALL"
  }
}

export function selectFleet(fleet) {
  return {
    type: "SELECT_FLEET",
    fleet: fleet
  }
}

export function setDatabaseConnected() {
  return {
    type: "database/connected"
  }
}

export function setDatabaseDisconnected() {
  return {
    type: "database/disconnected"
  }
}

export function setSelectedVehicleHistory(history) {
  return {
    type: "selected/vehicle/history",
    payload: history,
  }
}

export function setSocketConnected() {
  return {
    type: "socket/connect"
  }
}

export function setSocketDisconnected() {
  return {
    type: "socket/disconnect"
  }
}

export function animationPlay() {
  return {
    type: "animation/play",
  };
};

export function animationPause() {
  return {
    type: "animation/pause",
  };
};

export function animationStop() {
  return {
    type: "animation/stop",
  };
};

export function setAnimationSpeed(value) {
  return {
    type: "animation/speed",
    payload: value,
  };
};

export function setAutoUpdate(enabled) {
  return {
    type: "AUTOUPDATE",
    value: enabled
  };
}

export function selectMapVehicleId(id) {
  return {
    type: "SET_MAP_VEHICLE",
    value: id
  }
}

export function changedHistoryMarkers(markers) {
  return {
    type: "markers/history/changed",
    payload: markers
  };
}

export function changedFleetMarkers(markers) {
  return {
    type: "markers/fleet/changed",
    payload: markers
  };
}

export function changeGoogleMap(map) {
  return {
    type: "map/google/changed",
    payload: map
  };
}
