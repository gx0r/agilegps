import { createSelector } from 'reselect';

// TODO
const vehiclesByID = (state) => state.vehiclesByID;
// const selectedAllFleets = (state)

export const getImpliedSelectedVehicles = createSelector(
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
