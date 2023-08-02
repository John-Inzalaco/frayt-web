import { Button, FormGroup, InputGroup } from '@blueprintjs/core';
import { Field, Form, Formik, FormikHelpers, FormikProps } from 'formik';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Agreement,
  getUserAgreements,
  NewUserData,
} from '../../../lib/actions/UserAction';
import { useDidMount } from '../../../lib/Hooks';
import { registerUser } from '../../../lib/reducers/userSlice';
import { useAppDispatch } from '../../../lib/store';
import AgreementInput, {
  agreementsSchema,
  initialAgreementsValues,
} from './AgreementInput';
import * as yup from 'yup';
import { passwordType } from '../../form/PasswordInput';
import FieldError from '../../form/FieldError';

type RegistrationValues = Pick<
  NewUserData,
  | 'first_name'
  | 'last_name'
  | 'phone'
  | 'company'
  | 'agreements'
  | 'email'
  | 'password'
  | 'commercial'
>;

const registrationSchema: yup.SchemaOf<RegistrationValues> =
  agreementsSchema.shape({
    commercial: yup
      .boolean()
      .required()
      .isTrue('Only commercial shippers are allowed'),
    first_name: yup.string().required('First name is required'),
    last_name: yup.string().required('Last name is required'),
    phone: yup.string().required('Phone number is required'),
    company: yup.string().required('Company name is required'),
    email: yup.string().required('Email is required').email('Email is invalid'),
    password: passwordType,
  });

type RegistrationFormProps = {
  shipScreen: boolean;
};

export default function RegistrationForm({
  shipScreen,
}: RegistrationFormProps) {
  const labelClass = shipScreen ? undefined : 'whiteLabel';
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const dispatch = useAppDispatch();
  const formik = React.createRef<FormikProps<RegistrationValues>>();
  const didMount = useDidMount();

  const handleFormSubmit = (
    values: RegistrationValues,
    actions: FormikHelpers<RegistrationValues>
  ) => {
    dispatch(registerUser(values)).finally(() => actions.setSubmitting(false));
  };

  const fetchAgreements = useCallback(async () => {
    try {
      const result = await getUserAgreements();
      const { agreement_documents: agreements } = result.data;

      if (formik.current) {
        for (let index = 0; index < agreements.length; index++) {
          const agreement = agreements[index],
            name = `agreements[${index}]`;

          formik.current.setFieldValue(name + 'document_id', agreement.id);
          formik.current.setFieldValue(name + 'agreed', false);
        }
      }

      setAgreements(agreements);
    } catch (e) {
      console.error(e);
    }
  }, [formik]);

  useEffect(() => {
    if (!didMount) fetchAgreements();
  }, [fetchAgreements, didMount]);

  const initialValues: RegistrationValues = {
    email: '',
    password: '',
    company: '',
    phone: '',
    first_name: '',
    last_name: '',
    agreements: initialAgreementsValues(agreements),
    commercial: true,
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleFormSubmit}
      innerRef={formik}
      validateSchema={registrationSchema}
    >
      {({ errors, touched, isSubmitting }) => {
        return (
          <Form className='u-push__top--lg'>
            <div className='sameRow'>
              <FormGroup
                label='FIRST NAME *'
                labelFor='first_name'
                className={labelClass}
              >
                <Field type='text' name='first_name' as={InputGroup} />
                <FieldError name='first_name' />
              </FormGroup>
              <FormGroup
                label='LAST NAME *'
                labelFor='last_name'
                className={labelClass}
              >
                <Field type='text' name='last_name' as={InputGroup} />
                <FieldError name='last_name' />
              </FormGroup>
            </div>
            <div>
              <FormGroup
                label='EMAIL *'
                labelFor='email'
                className={labelClass}
              >
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
                  label='PHONE *'
                  labelFor='phone'
                  className={labelClass}
                >
                  <Field
                    type='phone'
                    name='phone'
                    className='bp4-input-group-icon'
                    leftIcon='phone'
                    as={InputGroup}
                  />
                  <FieldError name='phone' />
                </FormGroup>
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
                {errors.password && touched.password && errors.password}
              </div>
            </div>
            <div>
              <FormGroup
                labelFor='company'
                className={labelClass}
                label='COMPANY NAME *'
              >
                <Field type='text' name='company' as={InputGroup} />
              </FormGroup>
              {agreements.map((agreement, index) => (
                <AgreementInput
                  key={agreement.id}
                  agreement={agreement}
                  index={index}
                  className={shipScreen ? 'agreement-light' : 'agreement-dark'}
                />
              ))}
            </div>
            <Button
              text='Sign Up'
              large
              fill
              id='login-button'
              className='primaryButtonFilled registrationAction u-push__top--sm'
              type='submit'
              loading={isSubmitting}
              disabled={isSubmitting}
            />
          </Form>
        );
      }}
    </Formik>
  );
}
