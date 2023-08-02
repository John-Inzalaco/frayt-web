import React, { useEffect, useState } from 'react';
import { FormGroup, Button } from '@blueprintjs/core';
import { Grid, Row, Col } from 'react-flexbox-grid';
import { Field, Form, Formik } from 'formik';
import { useNavigate } from 'react-router-dom';
import ErrorCallout from '../components/ErrorCallout';
import { resetPassword, ResetPasswordData } from '../lib/actions/UserAction';
import { useSelector } from 'react-redux';
import { fetchUser, selectAuthStatus } from '../lib/reducers/userSlice';
import { useAppDispatch } from '../lib/store';
import { getErrorMessage } from '../lib/FraytRequest';
import FieldError from '../components/form/FieldError';
import PasswordInput, { passwordType } from '../components/form/PasswordInput';
import * as yup from 'yup';

type ResetPasswordFormProps = {
  setSent: React.Dispatch<boolean>;
  setError: React.Dispatch<string | null>;
};

const passwordSchema: yup.SchemaOf<ResetPasswordData> = yup.object().shape({
  password_reset_code: yup.string().required('Cannot be empty'),
  password: passwordType,
  password_confirmation: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Your passwords do not match'),
});

function ResetPasswordForm({ setSent, setError }: ResetPasswordFormProps) {
  const navigate = useNavigate();

  const handleFormSubmit = async (values: ResetPasswordData) => {
    await resetPassword(values);

    setSent(true);
  };

  const initialValues: ResetPasswordData = {
    password_reset_code: '',
    password: '',
    password_confirmation: '',
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={passwordSchema}
      validateOnMount={true}
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
      {({ isSubmitting, isValid }) => (
        <div>
          <Form>
            <FormGroup
              label='TEMPORARY PASSWORD'
              labelFor='password_reset_code'
              className='whiteLabel'
            >
              <Field as={PasswordInput} name='password_reset_code' />
              <FieldError name='password_reset_code' />
            </FormGroup>

            <FormGroup
              label='NEW PASSWORD'
              labelFor='password'
              className='whiteLabel'
            >
              <Field as={PasswordInput} name='password' />
              <FieldError name='password' />
            </FormGroup>

            <FormGroup
              label='CONFIRM PASSWORD'
              labelFor='password_confirmation'
              className='whiteLabel'
            >
              <Field as={PasswordInput} name='password_confirmation' />
              <FieldError name='password_confirmation' />
            </FormGroup>
            <Button
              // icon="key"
              text={'Submit'} // Do not change buttons names without notifying Tracy, Google Tag Manager is targeting the names
              large
              fill
              className={'primaryButtonFilled'}
              type='submit'
              loading={isSubmitting}
              disabled={isSubmitting || !isValid}
              style={{ marginTop: 40 }}
            />
          </Form>
          <Button
            text='Back'
            large
            fill
            className='whiteButton'
            onClick={() => {
              navigate('/');
            }}
            style={{ marginTop: 10 }}
          />
        </div>
      )}
    </Formik>
  );
}

export default function ResetPasswordScreen() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const authStatus = useSelector(selectAuthStatus);

  useEffect(() => {
    if (authStatus !== 'succeeded') {
      navigate('/');
    }
  }, [authStatus, navigate]);

  return (
    <div className='appContent login'>
      <Grid className='login-fullheight'>
        <Row className='login-centered'>
          <Col xs={0} md={3} lg={4} className='unusedMobileColumn'></Col>
          <Col xs={12} md={6} lg={4} className='leftColumn'>
            <div>
              <div className='actionForm' style={{ paddingTop: 50 }}>
                <img
                  src={'/img/logo-badge.png'}
                  className='centerImage'
                  style={{ width: '25%', marginBottom: 30 }}
                  alt='Frayt'
                />
                {sent ? (
                  <div>
                    <h1 className='loginHeader'>Success</h1>
                    <h2 className='loginDriver'>
                      {
                        "Your password was changed, and you're now ready to ship!"
                      }
                    </h2>
                  </div>
                ) : (
                  <div>
                    <h1 className='loginHeader'>Reset Password</h1>
                    <h2 className='loginDriver'>
                      {
                        'You need to change your password before you may proceed.'
                      }
                    </h2>
                  </div>
                )}
                <ErrorCallout error={error} />
                {sent ? (
                  <Button
                    icon='offline'
                    text='Ship Now'
                    large
                    fill
                    className='whiteButton'
                    onClick={async () => {
                      await dispatch(fetchUser());
                      navigate('/ship');
                    }}
                  />
                ) : (
                  <ResetPasswordForm setSent={setSent} setError={setError} />
                )}
              </div>
            </div>
          </Col>
        </Row>
      </Grid>
    </div>
  );
}
