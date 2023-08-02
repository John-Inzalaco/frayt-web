import { FormGroup, InputGroup, InputGroupProps } from '@blueprintjs/core';
import { Field, useField } from 'formik';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { usePrevious } from '../../lib/Hooks';
import FieldError from './FieldError';

type DecimalInputProps = {
  name: string;
  label: string;
  decimals: number;
  multipler?: number;
  children?: React.ReactNode;
  showError?: boolean;
  ignoreTouched?: boolean;
} & InputGroupProps;

type DecimalValue = number | string | undefined | null;

const replaceAllButFirstDecimal = (str: string) => {
  const firstIndex = (str.indexOf('.') || -1) + 1;
  return (
    str.substring(0, firstIndex) + str.slice(firstIndex).replace(/\./g, '')
  );
};

export default function DecimalInput({
  name,
  label,
  decimals,
  children,
  multipler = 1,
  showError = true,
  ignoreTouched = true,
  ...props
}: DecimalInputProps) {
  const [{ value }, , { setValue, setTouched }] = useField<DecimalValue>(name);
  const prevValue = usePrevious(value);

  const getTextValue = useCallback(
    (value: DecimalValue) =>
      typeof value === 'number'
        ? (value / multipler).toFixed(decimals)
        : value || '',
    [multipler, decimals]
  );

  const [textValue, setTextValue] = useState<string>(getTextValue(value));

  const handleBlur = ({
    currentTarget: { value },
  }: FormEvent<HTMLInputElement>) => {
    const number = value ? Number(value) : undefined;

    setTouched(true, false);
    if ((number || number === 0) && !isNaN(number)) {
      setValue(Math.floor(number * multipler));
    } else {
      setValue(value);
    }
  };

  const handleChange = ({
    currentTarget: { value: rawValue },
  }: FormEvent<HTMLInputElement>) => {
    const limitDecimalPlacesRegex = new RegExp(
      `(\\.[0-9]{${decimals}})(.*)$`,
      'g'
    );
    const value =
      typeof rawValue === 'number'
        ? rawValue
        : rawValue &&
          replaceAllButFirstDecimal(rawValue)
            .replace(/[^0-9.-]/g, '')
            .replace(limitDecimalPlacesRegex, (_match, group1) => group1);

    setTextValue(value);
  };

  useEffect(() => {
    if (value !== prevValue) {
      const newValue = getTextValue(value);
      if (textValue !== newValue) setTextValue(newValue);
    }
  }, [value, prevValue, textValue, setTextValue, getTextValue]);

  return (
    <FormGroup label={label} labelFor={name}>
      <Field
        as={InputGroup}
        name={name}
        onBlur={handleBlur}
        onChange={handleChange}
        value={textValue}
        {...props}
      />
      {children}
      {showError && <FieldError name={name} ignoreTouched={ignoreTouched} />}
    </FormGroup>
  );
}
