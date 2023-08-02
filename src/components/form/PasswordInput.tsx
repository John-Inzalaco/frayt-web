import {
  Button,
  InputGroup,
  InputGroupProps2,
  Intent,
} from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';
import { useState } from 'react';
import * as yup from 'yup';

export default function PasswordInput(props: InputGroupProps2) {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <InputGroup
      {...props}
      type={showPassword ? 'text' : 'password'}
      rightElement={
        <Tooltip2 content={`${showPassword ? 'Hide' : 'Show'} Password`}>
          <Button
            icon={showPassword ? 'unlock' : 'lock'}
            style={{ margin: 0 }}
            intent={Intent.WARNING}
            minimal={true}
            onClick={() => setShowPassword(!showPassword)}
          />
        </Tooltip2>
      }
    />
  );
}

export const passwordType = yup
  .string()
  .required('Cannot be empty')
  .min(8, 'Password must be at least 8 characters long')
  .matches(
    /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
    'Needs at least one special character'
  )
  .matches(/[0-9]/, 'Needs at least one number')
  .matches(/[a-zA-Z]/, 'Needs at least one alphabetic character');
