import { createSelector } from 'reselect';

const vehiclesByID = (state) => state.vehiclesByID

export const getVehiclesByDeviceID = createSelector(
  [vehiclesByID],
  (vehiclesByID) => {
    const vehiclesByDeviceID = {};
    Object.keys(vehiclesByID).forEach(key => {
      const vehicle = vehiclesByID[key];
      vehiclesByDeviceID[vehicle.device] = vehicle;
    });
    return vehiclesByDeviceID;
  }
)
