import { Button, FormGroup, InputGroup } from '@blueprintjs/core';
import { Field, Form, Formik } from 'formik';
import { useNavigate } from 'react-router-dom';
import { LoginData } from '../../../lib/actions/UserAction';
import { loginUser, updateOneSignalID } from '../../../lib/reducers/userSlice';
import { useAppDispatch } from '../../../lib/store';
import TextButton from '../../TextButton';
import * as yup from 'yup';
import FieldError from '../../form/FieldError';

const signInSchema: yup.SchemaOf<LoginData> = yup.object().shape({
  email: yup.string().required('Email is required'),
  password: yup.string().required('Password is required'),
});

type SignInFormProps = {
  shipScreen: boolean;
};

export default function SignInForm({ shipScreen }: SignInFormProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const labelClass = shipScreen ? undefined : 'whiteLabel';

  const initialValues: LoginData = {
    email: '',
    password: '',
  };

  return (
    <Formik
      validationSchema={signInSchema}
      initialValues={initialValues}
      onSubmit={async (values, actions) => {
        try {
          await dispatch(loginUser(values)).unwrap();
          await dispatch(updateOneSignalID());
        } catch (e) {
          actions.setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting }) => (
        <Form className='u-push__top--lg'>
          <div>
            <FormGroup label='EMAIL *' labelFor='email' className={labelClass}>
              <Field
                type='email'
                name='email'
                className='bp4-input-group-icon'
                leftIcon='envelope'
                as={InputGroup}
              />
              <FieldError name='email' />
            </FormGroup>
            <div className='sameRow'>
              <FormGroup
                label='PASSWORD *'
                labelFor='password'
                className={labelClass}
              >
                <Field
                  type='password'
                  name='password'
                  className='bp4-input-group-icon'
                  leftIcon='lock'
                  as={InputGroup}
                />
                <FieldError name='password' />
              </FormGroup>
            </div>
          </div>
          <p className='forgotPasswordLabel'>
            <TextButton
              type='button'
              onClick={() => navigate('/forgot-password')}
            >
              Forgot your password?
            </TextButton>
          </p>
          <Button
            text='Login'
            large
            fill
            id='login-button'
            className={'primaryButtonFilled loginAction u-push__top--sm'}
            type='submit'
            loading={isSubmitting}
            disabled={isSubmitting}
          />
        </Form>
      )}
    </Formik>
  );
}
