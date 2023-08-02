import React from 'react';
import { Checkbox, FormGroup } from '@blueprintjs/core';
import { useFormikContext } from 'formik';
import { Agreement, AgreementData } from '../../../lib/actions/UserAction';
import * as yup from 'yup';
import FieldError from '../../form/FieldError';

type AgreementValues = { agreements: AgreementData[] };

const agreementSchema: yup.SchemaOf<AgreementData> = yup.object().shape({
  document_id: yup.string().required(),
  agreed: yup
    .boolean()
    .required('Please agree to continue')
    .isTrue('Please agree to continue'),
});

export const agreementsSchema: yup.SchemaOf<AgreementValues> = yup
  .object()
  .shape({
    agreements: yup.array().of(agreementSchema),
  });

type AgreementLinksProps = {
  agreement: Agreement;
};

const AgreementLinks = ({ agreement }: AgreementLinksProps) => (
  <>
    {[agreement, ...agreement.support_documents]
      .map<React.ReactNode>(({ url, title }) => [
        <a href={url} target='_blank' rel='noreferrer' key={agreement.id}>
          {title}
        </a>,
      ])
      .reduce((prev, curr) => [prev, ', ', curr])}
  </>
);

type AgreementInputProps = {
  agreement: Agreement;
  index: number;
} & Omit<React.HTMLProps<HTMLDivElement>, 'form'>;

export default function AgreementInput<V extends AgreementValues>({
  agreement,
  index,

  ...props
}: AgreementInputProps) {
  const { values: formValues, handleChange } = useFormikContext<V>();
  const name = `agreements[${index}]`,
    id = `agreement_${agreement.id}`,
    values: AgreementData | undefined = formValues.agreements[index];

  return (
    <div {...props}>
      <FormGroup label={agreement.title} labelFor={id} style={{ marginTop: 5 }}>
        <Checkbox
          checked={!!(values && values.agreed)}
          name={name + 'agreed'}
          id={id}
          onChange={handleChange}
          className='inlineCheckbox'
        >
          <span>
            I Agree to <AgreementLinks agreement={agreement} />
          </span>
        </Checkbox>
        <FieldError name={name + 'agreed'} className='warningMessage' />
      </FormGroup>
    </div>
  );
}

export const initialAgreementsValues = (
  agreements: Agreement[]
): AgreementData[] =>
  agreements.map(({ id }) => ({
    document_id: id,
    agreed: false,
  }));
