import { useState } from 'react';
import { Formik, FormikHelpers, Field, Form } from 'formik';
import { Button, FormGroup, InputGroup } from '@blueprintjs/core';
import {
  getUserData,
  UserData,
  AddressData,
} from '../../lib/actions/UserAction';

import { useSelector } from 'react-redux';
import { selectUser, updateUser } from '../../lib/reducers/userSlice';
import { useAppDispatch } from '../../lib/store';
import { getErrorMessage } from '../../lib/FraytRequest';
import ErrorCallout from '../../components/ErrorCallout';
import * as yup from 'yup';
import FieldError from '../form/FieldError';

const addressSchema: yup.SchemaOf<AddressData> = yup.object().shape({
  address: yup.string().required(),
  city: yup.string().required(),
  state: yup.string().required(),
  zip: yup.string().required(),
});

const profileSchema: yup.SchemaOf<UserData> = yup.object().shape({
  company: yup.string(),
  address: addressSchema.nullable(),
  state: yup.mixed().optional().nullable(true).notRequired(),
  first_name: yup.string().required('First name required'),
  last_name: yup.string().required('Last name required'),
  phone: yup.string().required('Phone required'),
  email: yup.string().email('Email is invalid').required('Email required'),
});

export default function ProfileForm() {
  const dispatch = useAppDispatch();
  const user = useSelector(selectUser);
  const [error, setError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);
  if (!user) return null;

  const handleSubmit = async (
    values: UserData,
    { setSubmitting }: FormikHelpers<UserData>
  ) => {
    const action = dispatch(updateUser(values));

    try {
      await action.unwrap();
      setSucceeded(true);
    } catch (e) {
      setError(getErrorMessage(e));
      setSucceeded(false);
    }

    setSubmitting(false);
  };

  const initialValues: UserData = getUserData(user);
  return (
    <Formik
      validateOnChange
      initialValues={initialValues}
      validationSchema={profileSchema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting }) => (
        <Form>
          <ErrorCallout error={error} />
          <div className='sameRow'>
            <FormGroup label='FIRST NAME' labelFor='first_name'>
              <Field name='first_name' as={InputGroup} />
              <FieldError name='first_name' />
            </FormGroup>

            <FormGroup label='LAST NAME' labelFor='last_name'>
              <Field name='last_name' as={InputGroup} />
              <FieldError name='last_name' />
            </FormGroup>
          </div>

          <FormGroup
            label='EMAIL'
            labelFor='email'
            labelInfo='(Not modifiable)'
          >
            <Field name='email' as={InputGroup} disabled />
            <FieldError name='email' />
          </FormGroup>

          <FormGroup label='ADDRESS' labelFor='address.address'>
            <Field name='address.address' as={InputGroup} />
            <FieldError name='address.address' />
          </FormGroup>

          <div className='sameRow'>
            <FormGroup label='CITY' labelFor='address.city'>
              <Field name='address.city' as={InputGroup} />
              <FieldError name='address.city' />
            </FormGroup>

            <FormGroup label='STATE' labelFor='address.state'>
              <Field name='address.state' as={InputGroup} />
              <FieldError name='address.state' />
            </FormGroup>

            <FormGroup label='ZIP' labelFor='address.zip'>
              <Field name='address.zip' as={InputGroup} />
              <FieldError name='address.zip' />
            </FormGroup>
          </div>

          <FormGroup label='PHONE' labelFor='phone'>
            <Field name='phone' as={InputGroup} />
            <FieldError name='phone' />
          </FormGroup>

          <Button
            icon={succeeded ? 'tick-circle' : 'tick'}
            text={succeeded ? 'Saved!' : 'Save'}
            loading={isSubmitting}
            large
            fill
            type='submit'
            disabled={isSubmitting}
          />
        </Form>
      )}
    </Formik>
  );
}
