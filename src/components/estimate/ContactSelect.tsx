import { Radio } from '@blueprintjs/core';
import { useField } from 'formik';
import { useEffect } from 'react';
import { flushSync } from 'react-dom';
import FormikRadioGroup from '../form/FormikRadioGroup';
import ContactFormGroup from './ContactFormGroup';
import { buildDeliveryContactValues } from './steps/Delivery';

type ContactSelectProps = {
  name: string;
  isSelfName: string;
  label: string;
  verbose?: boolean;
};
export default function ContactSelect({
  name,
  isSelfName,
  label,
  verbose,
}: ContactSelectProps) {
  const [{ value: isSelf }] = useField(isSelfName);
  const [{ value: contact }, , { setValue: setContact }] = useField(name);

  useEffect(() => {
    if (isSelf && contact) {
      flushSync(() => setContact(null));
    } else if (isSelf === false && !contact) {
      flushSync(() => setContact(buildDeliveryContactValues()));
    }
  }, [isSelf, contact, setContact]);

  return (
    <div className='u-push__top--lg'>
      <FormikRadioGroup
        label={label.toUpperCase() + ' CONTACT'}
        name={isSelfName}
        inline
        type='boolean'
      >
        <Radio value='true'>
          <p className='u-display__inline-block'>
            <strong>Me</strong>
            {verbose && ` – I will be the primary contact for this ${label}`}
          </p>
        </Radio>
        <Radio value='false'>
          <p className='u-display__inline-block'>
            <strong>Other</strong>
            {verbose &&
              ` – Another person will be the primary contact for this ${label}`}
          </p>
        </Radio>
      </FormikRadioGroup>
      {isSelf === false && <ContactFormGroup name={name} label={label} />}
    </div>
  );
}
