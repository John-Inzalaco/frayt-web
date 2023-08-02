import { Field, useField } from 'formik';
import { FormGroup, HTMLSelect } from '@blueprintjs/core';
import { SignatureType } from '../../lib/actions/MatchAction';

const signatureTypes: { label: string; value: SignatureType }[] = [
  { value: SignatureType.Electronic, label: 'Electronic Signature' },
  { value: SignatureType.Photo, label: 'Photo Signature' },
];

export const SignatureTypeSelect = ({ name }: { name: string }) => {
  const [{ value }] = useField<string>(`${name}`);

  return (
    <FormGroup label={'Signature Type'} labelFor={name}>
      <Field
        as={HTMLSelect}
        name={name}
        options={signatureTypes}
        value={value}
        className='select'
      />
    </FormGroup>
  );
};
