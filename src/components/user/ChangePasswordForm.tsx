import { useState } from 'react';
import { Formik, FormikHelpers, Field, Form } from 'formik';
import { Button, FormGroup } from '@blueprintjs/core';
import {
  updatePassword,
  UpdatePasswordData,
} from '../../lib/actions/UserAction';
import PasswordInput, { passwordType } from '../form/PasswordInput';
import { getErrorMessage } from '../../lib/FraytRequest';
import ErrorCallout from '../../components/ErrorCallout';
import FieldError from '../form/FieldError';
import * as yup from 'yup';

const passwordSchema: yup.SchemaOf<UpdatePasswordData> = yup.object().shape({
  old: yup.string().required('Cannot be empty'),
  new: passwordType,
});

export default function ChangePasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async (
    values: UpdatePasswordData,
    { setSubmitting }: FormikHelpers<UpdatePasswordData>
  ) => {
    setSucceeded(false);

    setError(null);

    try {
      await updatePassword(values);

      setSucceeded(true);
    } catch (e) {
      setSucceeded(false);
      setError(getErrorMessage(e));
    }

    setSubmitting(false);
  };

  const initialValues: UpdatePasswordData = {
    old: '',
    new: '',
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={passwordSchema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting }) => (
        <Form>
          <ErrorCallout error={error} />
          <div className='sameRow'>
            <FormGroup label='OLD PASSWORD' labelFor='old'>
              <Field as={PasswordInput} name='old' />
              <FieldError name='old' />
            </FormGroup>

            <FormGroup label='NEW PASSWORD' labelFor='new'>
              <Field as={PasswordInput} name='new' />
              <FieldError name='new' />
            </FormGroup>
          </div>

          <Button
            icon={succeeded ? 'tick-circle' : 'tick'}
            text={succeeded ? 'New Password Saved!' : 'Save'}
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
