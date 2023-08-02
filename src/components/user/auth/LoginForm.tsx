import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Button } from '@blueprintjs/core';
import { useNavigate } from 'react-router-dom';
import ErrorCallout from '../../ErrorCallout';
import { useSelector } from 'react-redux';
import {
  selectAuthStatus,
  selectUserErrors,
} from '../../../lib/reducers/userSlice';
import { UserType } from './Login';
import RegistrationForm from './RegistrationForm';
import SignInForm from './SignInForm';

type LoginFormType = 'registration' | 'signin';

type LoginFormProps = {
  userType: UserType;
  shipScreen: boolean;
};

type LoginActionsProps = {
  userType: UserType;
  formType?: LoginFormType;
  setFormType: Dispatch<SetStateAction<LoginFormType>>;
};

function LoginActions({
  userType,
  formType,
  setFormType,
  shipScreen,
}: LoginActionsProps & LoginFormProps) {
  const toggleFormType = () => {
    const newFormType = formType === 'signin' ? 'registration' : 'signin';

    setFormType(newFormType);
  };

  return (
    <div>
      {formType === 'registration' && userType === 'shipper' && (
        <RegistrationForm shipScreen={shipScreen} />
      )}
      {formType === 'signin' && <SignInForm shipScreen={shipScreen} />}

      <div
        className={shipScreen ? 'registerButton--shipScreen' : 'registerButton'}
      >
        <p
          className={shipScreen ? 'registerLabel--shipScreen' : 'registerLabel'}
        >
          {formType === 'signin'
            ? "Don't have an account?"
            : 'Already have a shipper account?'}
        </p>
        <Button
          text={formType === 'signin' ? 'Register' : 'Login'}
          large
          fill
          id='show-login'
          className={shipScreen ? 'secondaryButton' : 'whiteButton'}
          onClick={toggleFormType}
        />
      </div>
    </div>
  );
}

export default function LoginForm({ userType, shipScreen }: LoginFormProps) {
  const error = useSelector(selectUserErrors);
  const authorized = useSelector(selectAuthStatus) === 'succeeded';
  const navigate = useNavigate();
  const [formType, setFormType] = useState<LoginFormType>('registration');

  useEffect(() => {
    if (authorized && formType === 'registration') {
      navigate('/welcome');
    } else if (authorized) {
      navigate('/ship');
    }
  }, [authorized, formType, navigate]);

  return (
    <>
      <ErrorCallout error={error} />
      <LoginActions
        userType={userType}
        formType={formType}
        setFormType={setFormType}
        shipScreen={shipScreen}
      />
    </>
  );
}
