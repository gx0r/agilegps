import * as React from 'react';
import { Field } from 'formik';

export function createDeviceSelector(devicesByID, selectedDeviceId, orgId = null) {
  return (
    <Field className="form-control" as="select" name="device" defaultValue={ selectedDeviceId } >
      <option key="" value=""></option>
      {
        Object.keys(devicesByID).map(key => {
          const device = devicesByID[key];
          console.log(key);
          if (device.orgid === orgId) {
            return <option key={ device.imei } value={ device.imei }>{ device.imei }</option>
          }
        })
      }
    </Field>
  );
}
