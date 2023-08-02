import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Button, FormGroup, InputGroup, Spinner } from '@blueprintjs/core';
import { useSelector } from 'react-redux';
import {
  fetchCreditCard,
  selectCreditCard,
  selectUser,
} from '../../lib/reducers/userSlice';
import { Elements } from '@stripe/react-stripe-js';
import InjectedCheckoutForm from './InjectedCheckoutForm';
import { useAppDispatch } from '../../lib/store';
import { getUserCompany } from '../../lib/Utility';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_CODE);

export function PaymentChoice() {
  const dispatch = useAppDispatch();
  const [editCard, setEditCard] = useState(false);
  const creditCard = useSelector(selectCreditCard);
  const user = useSelector(selectUser);
  const company = getUserCompany(user);
  const [fetching, setFetching] = useState(false);

  const cancel = () => {
    setEditCard(false);
  };

  useEffect(() => {
    if (
      !company?.account_billing_enabled &&
      typeof creditCard === 'undefined' &&
      !fetching
    ) {
      setFetching(true);
      dispatch(fetchCreditCard()).then(() => setFetching(false));
    }
  }, [dispatch, company, creditCard, fetching]);

  useEffect(() => {
    setEditCard(!creditCard);
  }, [creditCard]);

  if (company?.account_billing_enabled) {
    return (
      <div>
        <p>
          <b>Invoiced on Net {company.invoice_period}</b>
        </p>
        <p>
          {company.name}&apos;s account is authorized to use Account Billing.
          You will receive an invoice from us upon completion of a Match on a{' '}
          <b>Net {company.invoice_period}</b>.
        </p>
        <p>
          When placing your Matches, you agree to pay for the completed service
          at the final cost. The final cost will vary by no more than $30 from
          the estimated price.
        </p>
      </div>
    );
  } else {
    if (fetching) {
      return <Spinner />;
    } else if (editCard) {
      return (
        <div>
          <Elements stripe={stripePromise}>
            <InjectedCheckoutForm cancelEditCreditCard={cancel} />
          </Elements>
        </div>
      );
    } else {
      let ccNumber;
      if (creditCard) {
        ccNumber = '**** **** **** ' + creditCard;
      }
      return (
        <div>
          <FormGroup label='CREDIT CARD' labelFor='creditCard'>
            <InputGroup
              name='creditCard'
              id='creditCard'
              className='bp4-input-group-icon'
              value={ccNumber}
              disabled={true}
              leftIcon='credit-card'
            />
          </FormGroup>

          <Button
            icon={'edit'}
            className={'nextStep secondaryButtonFilled'}
            text={creditCard ? 'Update' : 'Add Card'}
            large
            fill
            onClick={() => setEditCard(true)}
          />
        </div>
      );
    }
  }
}
