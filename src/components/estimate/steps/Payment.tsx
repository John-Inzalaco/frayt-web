import { Button, FormGroup, InputGroup, Spinner } from '@blueprintjs/core';
import LoginForm from '../../user/auth/LoginForm';
import { PaymentChoice } from '../../user/PaymentChoice';
import 'moment-timezone';
import { ShipTabProps } from '../../../screens/ShipScreen';
import StepFooter from '../StepFooter';
import { Field, Formik, FormikHelpers } from 'formik';
import { selectCreditCard, selectUser } from '../../../lib/reducers/userSlice';
import { useSelector } from 'react-redux';
import { MatchData } from '../../../lib/actions/MatchAction';
import {
  selectEstimate,
  selectEstimateErrors,
  selectEstimateStatus,
  updateEstimate,
} from '../../../lib/reducers/estimateSlice';
import { useAppDispatch } from '../../../lib/store';
import { getUserCompany } from '../../../lib/Utility';
import MatchDiscount from '../MatchDiscount';

type PaymentValues = PickOptional<MatchData, 'coupon_code'>;

export default function Payment({ changeTab }: ShipTabProps) {
  const user = useSelector(selectUser);
  const creditCard = useSelector(selectCreditCard);
  const match = useSelector(selectEstimate);
  const error = useSelector(selectEstimateErrors);
  const status = useSelector(selectEstimateStatus);
  const dispatch = useAppDispatch();
  const handleSubmit = (
    values: PaymentValues,
    actions: FormikHelpers<PaymentValues>
  ) => {
    console.log('match', match, 'data', values);
    if (match)
      dispatch(updateEstimate([match.id, values])).then(() =>
        actions.setSubmitting(false)
      );
  };

  const initialValues: PaymentValues = {
    coupon_code: match?.coupon?.code,
  };

  const errorIndex = error ? error.indexOf('Coupon code') : 0;

  return user ? (
    <div>
      <h1 className='u-push__top--none'>Payment</h1>
      <PaymentChoice />
      <div className='panelDivider u-push__bottom--lg' />

      <Formik onSubmit={handleSubmit} initialValues={initialValues}>
        {({ submitForm }) => (
          <>
            <div>
              <FormGroup label='COUPON' labelFor='coupon_code'>
                <Field
                  as={InputGroup}
                  name='coupon_code'
                  rightElement={
                    <Button
                      onClick={submitForm}
                      className='input-addon'
                      disabled={status === 'loading'}
                    >
                      {status === 'loading' ? <Spinner size={20} /> : 'Apply'}
                    </Button>
                  }
                />
                {status === 'failed' && error && (
                  <p className='error'>
                    {errorIndex ? error.slice(errorIndex) : error}
                  </p>
                )}
              </FormGroup>
            </div>

            <MatchDiscount match={match} />

            <StepFooter
              onPrev={() => changeTab(-1)}
              onNext={() => changeTab(1)}
              error={
                creditCard || getUserCompany(user)?.account_billing_enabled
                  ? null
                  : 'Payment method is required'
              }
              hideRequestError
            />
          </>
        )}
      </Formik>
    </div>
  ) : (
    <LoginForm userType='shipper' shipScreen />
  );
}
