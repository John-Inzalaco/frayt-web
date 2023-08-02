import { Checkbox, Icon } from '@blueprintjs/core';
import React from 'react';
import { displayPrice, findFee } from '../../lib/Utility';
import { Field, getIn, useField, useFormikContext } from 'formik';
import { useSelector } from 'react-redux';
import {
  selectEstimate,
  selectEstimateStatus,
} from '../../lib/reducers/estimateSlice';
import FieldError from '../form/FieldError';

type ServiceToggleProps = {
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
  name: string;
  fee_type: string;
};

export default function ServiceToggle({
  disabled,
  label,
  children,
  name,
  fee_type,
}: ServiceToggleProps) {
  const [{ value }] = useField<boolean>(name);
  const { isValid } = useFormikContext();
  const match = useSelector(selectEstimate);
  const status = useSelector(selectEstimateStatus);
  const fee = findFee(match?.fees || [], fee_type);
  const serverValue = getIn(match, name);

  return (
    <>
      <Field as={Checkbox} name={name} disabled={disabled} checked={value}>
        <Icon icon='box' className='u-push__right--xs' />
        <strong>{label}</strong>
        {value &&
          (status !== 'loading' && serverValue === value ? (
            <>
              {' + ' + displayPrice(fee?.amount || 0)}{' '}
              {fee?.description && <i> – {fee.description}</i>}
            </>
          ) : status === 'loading' || isValid ? (
            <i> + calculating</i>
          ) : (
            <i> + will be calculated</i>
          ))}
        <br />
        <span style={{ marginTop: 4, display: 'block' }}>{children}</span>
      </Field>
      <FieldError name={name} />
    </>
  );
}
