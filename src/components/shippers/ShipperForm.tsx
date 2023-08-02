import {
  Button,
  Callout,
  FormGroup,
  HTMLSelect,
  InputGroup,
  Spinner,
} from '@blueprintjs/core';
import { Field, Form, Formik } from 'formik';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { getLocationOptions } from '../../lib/Utility';
import { createShipper, updateShipper } from '../../lib/reducers/shippersSlice';
import { selectUser } from '../../lib/reducers/userSlice';
import { Shipper, ShipperData } from '../../lib/actions/ShipperAction';
import { useAppDispatch } from '../../lib/store';
import { getErrorMessage } from '../../lib/FraytRequest';

export type ShipperFormProps = {
  actions: React.ReactNode;
  shipper?: Shipper;
  onSubmit: () => void;
  submitLabel: React.ReactNode;
};

export default function ShipperForm({
  actions,
  shipper,
  onSubmit,
  submitLabel,
}: ShipperFormProps) {
  const dispatch = useAppDispatch();
  const user = useSelector(selectUser);
  const [error, setError] = useState<string | null>(null);
  const initialValues: Partial<ShipperData> = shipper
    ? {
        first_name: shipper.first_name,
        last_name: shipper.last_name,
        role: shipper.role,
        location_id: shipper.location?.id,
        phone: shipper.phone,
        user: {
          email: shipper.email,
        },
      }
    : {
        role: 'member',
        location_id: user?.location?.id,
      };

  const upsertShipper = async (values: Partial<ShipperData>) => {
    setError(null);
    let action;
    if (shipper && shipper.id) {
      action = dispatch(updateShipper([shipper.id, values]));
    } else {
      action = dispatch(createShipper(values));
    }

    try {
      await action.unwrap();

      onSubmit();
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  return (
    <Formik initialValues={initialValues} onSubmit={upsertShipper}>
      {({ isSubmitting }) => (
        <Form className='sameRow'>
          <FormGroup label='FIRST NAME' labelFor='firstName'>
            <Field as={InputGroup} name='first_name' id='firstName' />
          </FormGroup>
          <FormGroup label='LAST NAME' labelFor='lastName'>
            <Field as={InputGroup} name='last_name' id='lastName' />
          </FormGroup>
          <FormGroup label='EMAIL' labelFor='email'>
            <Field as={InputGroup} name='user[email]' id='email' />
          </FormGroup>
          <FormGroup label='PHONE' labelFor='phone'>
            <Field as={InputGroup} name='phone' id='phone' />
          </FormGroup>
          {user?.role === 'company_admin' && (
            <>
              <FormGroup label='ROLE' labelFor='role'>
                <Field
                  as={HTMLSelect}
                  options={[
                    { label: 'Location Admin', value: 'location_admin' },
                    { label: 'Member', value: 'member' },
                  ]}
                  name='role'
                  id='role'
                  className='select'
                />
              </FormGroup>
              <FormGroup label='Location' labelFor='locationId'>
                <Field
                  as={HTMLSelect}
                  options={getLocationOptions(user)}
                  name='location_id'
                  id='locationId'
                  className='select'
                />
              </FormGroup>
            </>
          )}
          <hr />
          {error && (
            <>
              <Callout intent='danger'>{error}</Callout>
              <br />
            </>
          )}

          <div>
            <Button
              rightIcon={isSubmitting && <Spinner size={20} />}
              className='buttonPrimary'
              disabled={isSubmitting}
              text={submitLabel}
              type='submit'
            />
            {actions}
          </div>
        </Form>
      )}
    </Formik>
  );
}
