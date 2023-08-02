/* eslint-disable react/no-children-prop */
import { useEffect, useState } from 'react';
import {
  Checkbox,
  FormGroup,
  InputGroup,
  Label,
  TextArea,
} from '@blueprintjs/core';
import 'moment-timezone';
import 'react-phone-number-input/style.css';
import { ShipTabProps } from '../../../screens/ShipScreen';
import { useSelector } from 'react-redux';
import {
  selectEstimate,
  updateEstimate,
} from '../../../lib/reducers/estimateSlice';
import {
  Contact,
  ContactData,
  Match,
  MatchData,
  MatchStop,
  MatchStopData,
  SignatureType,
} from '../../../lib/actions/MatchAction';
import { useAppDispatch } from '../../../lib/store';
import { usePrevious } from '../../../lib/Hooks';
import {
  Field,
  Form,
  Formik,
  FormikHelpers,
  getIn,
  yupToFormErrors,
} from 'formik';
import StepFooter from '../StepFooter';
import FieldError from '../../form/FieldError';
import * as yup from 'yup';
import { SchemaOf, TestContext } from 'yup';
import { validPhoneNumber } from '../../../lib/Validation';
import ContactSelect from '../ContactSelect';
import { alphaIndex, isObject } from '../../../lib/Utility';
import { SignatureTypeSelect } from '../SignatureTypeSelect';

type DeliveryContactValues = ContactData | null;

type DeliveryStopValues = {
  recipient: DeliveryContactValues;
} & PickOptional<
  MatchStopData,
  | 'po'
  | 'delivery_notes'
  | 'signature_instructions'
  | 'signature_required'
  | 'signature_type'
  | 'destination_photo_required'
> &
  PickRequired<MatchStopData, 'id' | 'self_recipient'>;

type DeliveryValues = {
  sender: DeliveryContactValues;
  stops: DeliveryStopValues[];
} & PickRequired<MatchData, 'self_sender'> &
  PickOptional<
    MatchData,
    'po' | 'pickup_notes' | 'bill_of_lading_required' | 'origin_photo_required'
  >;

const isContactData = (contact: unknown): contact is ContactData => {
  return isObject(contact, ['name', 'notify']);
};

const hasContactForNotify = (
  value: unknown,
  { parent }: TestContext<unknown>
) => {
  if (isContactData(parent)) {
    return parent.notify ? !!(parent.email || parent.phone_number) : true;
  }

  return true;
};

export const contactSchema: SchemaOf<DeliveryContactValues> = yup.object({
  name: yup.string().required('Name is required'),
  email: yup
    .string()
    .email('Email is invalid')
    .nullable()
    .test(
      'hasContactForNotify',
      'Email is required unless phone is provided',
      hasContactForNotify
    ),
  phone_number: yup
    .string()
    .nullable()
    .test(
      'hasContactForNotify',
      'Phone is required unless email is provided',
      hasContactForNotify
    )
    .test('isValidPhoneNumber', 'Phone number is invalid', validPhoneNumber),
  notify: yup.boolean().required(),
});

const deliveryStopSchema: SchemaOf<DeliveryStopValues> = yup.object({
  id: yup.string().required(),
  self_recipient: yup.boolean().required('The recipient must be specified'),
  po: yup.string().nullable(),
  delivery_notes: yup.string().nullable(),
  signature_required: yup.boolean(),
  signature_type: yup
    .mixed<SignatureType>()
    .oneOf(Object.values(SignatureType))
    .required(),
  destination_photo_required: yup.boolean().required(),
  signature_instructions: yup
    .string()
    .nullable()
    .when('signature_type', {
      is: SignatureType.Photo,
      then: yup
        .string()
        .required('Signature instructions are required for Photo'),
    }),
  recipient: contactSchema.nullable().when('self_recipient', {
    is: false,
    then: (schema: typeof contactSchema) => schema.required(),
    otherwise: (schema: typeof contactSchema) => schema.oneOf([null]),
  }),
});

const deliverySchema: SchemaOf<DeliveryValues> = yup.object({
  po: yup.string().nullable(),
  pickup_notes: yup.string().nullable(),
  origin_photo_required: yup.boolean().required(),
  bill_of_lading_required: yup.boolean().required(),
  self_sender: yup.boolean().required('The sender must be specified'),
  sender: contactSchema.nullable().when('self_sender', {
    is: false,
    then: (schema: typeof contactSchema) => schema.required(),
    otherwise: (schema: typeof contactSchema) => schema.oneOf([null]),
  }),
  stops: yup.array().of(deliveryStopSchema),
});

export const buildDeliveryContactValues = (
  contact?: Contact | null
): DeliveryContactValues => {
  return {
    name: contact?.name || '',
    email: contact?.email || '',
    phone_number: contact?.phone_number || '',
    notify: contact?.notify || false,
  };
};

export const buildDeliveryStopValues = (
  stop: MatchStop
): DeliveryStopValues => {
  return {
    id: stop.id,
    po: stop.po || '',
    self_recipient: stop.self_recipient,
    delivery_notes: stop.delivery_notes || '',
    signature_type: stop.signature_type || SignatureType.Electronic,
    signature_instructions: stop.signature_instructions || '',
    destination_photo_required: stop.destination_photo_required || false,
    recipient: stop.self_recipient
      ? null
      : buildDeliveryContactValues(stop.recipient),
    signature_required: stop.signature_required,
  };
};

export const buildDeliveryValues = (match: Match): DeliveryValues => {
  return {
    pickup_notes: match.pickup_notes || '',
    bill_of_lading_required: match.bill_of_lading_required || false,
    origin_photo_required: match.origin_photo_required || false,
    po: match.po || '',
    self_sender: match.self_sender,
    sender: match.self_sender ? null : buildDeliveryContactValues(match.sender),
    stops: match.stops.map(stop => buildDeliveryStopValues(stop)),
  };
};

type DeliveryFormProps = {
  match: Match;
} & ShipTabProps;
function DeliveryForm({ match, changeTab }: DeliveryFormProps) {
  const dispatch = useAppDispatch();
  const prevMatch = usePrevious(match);
  const isRoute = match.stops.length > 1;
  const [initialValues, setInitialValues] = useState<DeliveryValues>(
    buildDeliveryValues(match)
  );

  const handleSubmit = async (
    values: DeliveryValues,
    actions: FormikHelpers<DeliveryValues>
  ) => {
    dispatch(updateEstimate([match.id, values])).then(() =>
      actions.setSubmitting(false)
    );
  };

  const validate = (values: DeliveryValues) => {
    try {
      deliverySchema.validateSync(values, {
        abortEarly: false,
        context: values,
      });
    } catch (e) {
      return yupToFormErrors(e); //for rendering validation errors
    }
  };

  useEffect(() => {
    if (prevMatch !== match) {
      const newValues = buildDeliveryValues(match);

      setInitialValues(newValues);
    }
  }, [match, prevMatch]);

  return (
    <Formik
      validateOnMount
      enableReinitialize
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validate={validate}
    >
      {({ values }) => (
        <Form>
          <h1 className='u-push__top--none'>Delivery</h1>

          {!isRoute && (
            <>
              <FormGroup
                label='P.O. / JOB #'
                labelInfo='(Optional)'
                labelFor='po'
              >
                <Field as={InputGroup} name='po' />
                <FieldError name='po' />
              </FormGroup>
              <div className='panelDivider' />
            </>
          )}

          <h3>PICKUP</h3>
          <Label>{match.origin_address.formatted_address}</Label>

          <FormGroup
            label='PICKUP NOTES'
            labelInfo='(Optional)'
            labelFor='pickup_notes'
          >
            <Field as={InputGroup} name='pickup_notes' />
            <FieldError name='pickup_notes' />
          </FormGroup>

          <FormGroup>
            <Field
              as={Checkbox}
              defaultChecked={initialValues.origin_photo_required}
              name='origin_photo_required'
            >
              Require Photo of Cargo at Pickup
            </Field>
          </FormGroup>
          <FormGroup>
            <Field
              as={Checkbox}
              defaultChecked={initialValues.bill_of_lading_required}
              name='bill_of_lading_required'
            >
              Require Photo of the Bill of Lading at Pickup
            </Field>
          </FormGroup>

          <ContactSelect
            name='sender'
            isSelfName='self_sender'
            label='pickup'
            verbose
          />

          {values.stops.map((newStop, index) => {
            const name = `stops[${index}]`;
            const stop: MatchStop | undefined = getIn(match, name);
            return (
              <div key={stop?.id}>
                <div className='panelDivider' />

                <h3>
                  {isRoute ? (
                    <>
                      STOP {alphaIndex(index)}
                      <span className='u-text--caption'>
                        {stop?.po && ' - ' + stop?.po}
                      </span>
                    </>
                  ) : (
                    'DROPOFF'
                  )}
                </h3>
                <Label>{stop?.destination_address?.formatted_address}</Label>
                <FormGroup
                  label='DELIVERY NOTES'
                  labelInfo='(Optional)'
                  labelFor={`${name}.delivery_notes`}
                >
                  <Field as={InputGroup} name={`${name}.delivery_notes`} />
                  <FieldError name={`${name}.delivery_notes`} />
                </FormGroup>
                <FormGroup>
                  <Field
                    defaultChecked={
                      initialValues.stops[index].signature_required
                    }
                    as={Checkbox}
                    name={`${name}.signature_required`}
                  >
                    Require Signature
                  </Field>
                </FormGroup>
                <SignatureTypeSelect name={`${name}.signature_type`} />
                <FormGroup
                  label={'Signature Instructions'}
                  labelFor={`${name}.signature_instructions`}
                >
                  <Field
                    as={TextArea}
                    name={`${name}.signature_instructions`}
                    large
                    fill
                  />
                  {newStop.signature_type === 'photo' && (
                    <p>
                      Please describe what the photo of the signature should
                      contain. E.g. &quot;Signed photo of the bill of
                      lading&quot;.
                    </p>
                  )}
                  <FieldError name={`${name}.signature_instructions`} />
                </FormGroup>
                <FormGroup>
                  <Field
                    defaultChecked={
                      initialValues.stops[index].destination_photo_required
                    }
                    as={Checkbox}
                    name={`${name}.destination_photo_required`}
                  >
                    Require Proof of Delivery
                  </Field>
                </FormGroup>

                <ContactSelect
                  name={`${name}.recipient`}
                  isSelfName={`${name}.self_recipient`}
                  label='stop'
                />
              </div>
            );
          })}

          <StepFooter
            onPrev={() => changeTab(-1)}
            onNext={() => changeTab(1)}
          />
        </Form>
      )}
    </Formik>
  );
}

export default function Delivery(props: ShipTabProps) {
  const match = useSelector(selectEstimate);

  if (match) {
    return <DeliveryForm match={match} {...props} />;
  } else {
    return null;
  }
}
