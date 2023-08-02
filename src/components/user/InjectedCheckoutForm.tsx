import { FormEvent, useState } from 'react';
import { CardElement, ElementsConsumer } from '@stripe/react-stripe-js';
import { Button } from '@blueprintjs/core';
import { Stripe, StripeElements } from '@stripe/stripe-js';
import { useSelector } from 'react-redux';
import { selectUser, updateCreditCard } from '../../lib/reducers/userSlice';
import { useAppDispatch } from '../../lib/store';
import { getErrorMessage } from '../../lib/FraytRequest';
import { isObject } from '../../lib/Utility';

type CheckoutFormProps = {
  elements: StripeElements | null;
  stripe: Stripe | null;
} & InjectedCheckoutFormProps;

function CheckoutForm({
  elements,
  stripe,
  cancelEditCreditCard,
}: CheckoutFormProps) {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const user = useSelector(selectUser);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!elements) {
      setLoading(false);
      setSuccess(false);
      setMessage('Encountered an issue loading Stripe');
      return;
    }

    setLoading(true);
    setMessage('');
    const cardElement = elements.getElement(CardElement);

    if (user && stripe && cardElement) {
      try {
        const { error, token } = await stripe.createToken(cardElement, {
          name: `${user.first_name} ${user.last_name}`,
        });

        if (error) {
          throw new Error(error.message);
        } else {
          if (!token.card) throw Error('Credit card is required');

          const action = dispatch(
            updateCreditCard({
              stripe_token: token.id,
              stripe_card: token.card.id,
            })
          );

          try {
            await action.unwrap();
            setSuccess(true);
            setMessage('');
            cancelEditCreditCard();
          } catch (e: unknown) {
            throw new Error(getErrorMessage(e));
          }
        }
      } catch (e) {
        const message =
          isObject(e, ['message']) && typeof e.message === 'string'
            ? e.message
            : 'Please recheck your credit card information.';
        setSuccess(false);
        setMessage(message);
      }
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className='StripeForm'>
      <label>
        <div style={{ marginBottom: 8 }}>
          Card details for {user?.first_name}
        </div>
        <CardElement options={{ style: { base: { fontSize: '18px' } } }} />
      </label>
      {message && (
        <div className='formError' style={{ marginTop: 10 }}>
          {message}
        </div>
      )}
      <div style={{ display: 'flex', marginTop: 21 }}>
        <Button
          icon={'undo'}
          text='Cancel'
          large
          fill
          className={'nextStep warningButton'}
          onClick={cancelEditCreditCard}
          style={{ marginRight: 10, flex: 1 }}
        />
        <Button
          icon={success ? 'tick-circle' : 'tick'}
          text={success ? 'Updated Card!' : 'Update Card'}
          loading={loading}
          disabled={loading}
          large
          fill
          type='submit'
          className={'nextStep-CCardAdd'}
          style={{ marginLeft: 10, flex: 2 }}
        />
      </div>
    </form>
  );
}

type InjectedCheckoutFormProps = {
  cancelEditCreditCard: () => void;
};

const InjectedCheckoutForm = (props: InjectedCheckoutFormProps) => {
  return (
    <ElementsConsumer>
      {({ elements, stripe }) => (
        <CheckoutForm elements={elements} stripe={stripe} {...props} />
      )}
    </ElementsConsumer>
  );
};

export default InjectedCheckoutForm;
