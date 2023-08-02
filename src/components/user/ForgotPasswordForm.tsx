import React from 'react';
import { InputGroup, FormGroup, Button } from '@blueprintjs/core';
import { Formik, Field, Form } from 'formik';
import { forgotPassword } from '../../lib/actions/UserAction';
import { getErrorMessage } from '../../lib/FraytRequest';
import * as yup from 'yup';
import FieldError from '../form/FieldError';

type ForgotPasswordFormProps = {
  setLinkSent: React.Dispatch<boolean>;
  setError: React.Dispatch<string | null>;
};

type ForgotPasswordValues = { email: string };

const emailSchema: yup.SchemaOf<ForgotPasswordValues> = yup.object().shape({
  email: yup.string().required('Email is required').email('Email is invalid'),
});

export default function ForgotPasswordForm({
  setLinkSent,
  setError,
}: ForgotPasswordFormProps) {
  const handleFormSubmit = async (values: ForgotPasswordValues) => {
    await forgotPassword(values.email);

    setLinkSent(true);
  };

  const initialValues: ForgotPasswordValues = { email: '' };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={emailSchema}
      onSubmit={async (values, actions) => {
        setError(null);
        try {
          await handleFormSubmit(values);
        } catch (error) {
          setError(getErrorMessage(error));

          actions.setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting }) => (
        <Form>
          <FormGroup label='EMAIL' labelFor='email' className='whiteLabel'>
            <Field
              as={InputGroup}
              type='email'
              name='email'
              className='bp4-input-group-icon'
              leftIcon='envelope'
            />
          </FormGroup>
          <FieldError name='email' className='loginError' />
          <Button
            text='Send' // Do not change buttons names without notifying Tracy, Google Tag Manager is targeting the names
            large
            fill
            className='primaryButtonFilled'
            type='submit'
            loading={isSubmitting}
            disabled={isSubmitting}
            style={{ marginTop: 40 }}
          />
        </Form>
      )}
    </Formik>
  );
}
