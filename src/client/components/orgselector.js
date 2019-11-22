import * as React from 'react';
import { Field } from 'formik';

export function createOrgSelector(orgsByID) {
  return (
    <Field className="form-control" as="select" name="orgid">
      {
        Object.keys(orgsByID).map(key => {
          const org = orgsByID[key];
          return <option key={ org.id } value={ org.id }>{ org.name }</option>
        })
      }
    </Field>
  );
}
