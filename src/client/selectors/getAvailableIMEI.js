import { createSelector } from 'reselect';

const devicesByID = state => state.devicesByID
const vehiclesByDeviceID = state => state.vehiclesByDeviceID;

export const getAvailableIMEI = createSelector(
  [devicesByID, vehiclesByDeviceID],
  (devicesByID, vehiclesByDeviceID) => {
    const available = [];
    Object.keys(devicesByID).forEach(deviceID => {
      if (!vehiclesByDeviceID[deviceID]) {
        available.push(deviceID);
      }
    });
    return available;
  }
)
