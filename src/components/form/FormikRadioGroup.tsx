import { RadioGroup, RadioGroupProps } from '@blueprintjs/core';
import { useField } from 'formik';
import { FormEvent } from 'react';

type TypeProps =
  | { type: 'boolean'; value?: boolean }
  | { type: 'number'; value?: number }
  | { type: 'string'; value?: string };

type FormikRadioGroupProps = {
  name: string;
  children: React.ReactNode;
} & Omit<RadioGroupProps, 'onChange'> &
  TypeProps;

export default function FormikRadioGroup({
  name,
  children,
  type = 'string',
  ...props
}: FormikRadioGroupProps) {
  const [, { value }, { setValue, setTouched }] =
    useField<typeof props.value>(name);

  const handleChange = (event: FormEvent<HTMLInputElement>) => {
    const rawValue = event.currentTarget.value;
    let safeValue: typeof props.value;
    switch (type) {
      case 'boolean':
        switch (rawValue) {
          case 'true':
            safeValue = true;
            break;
          case 'false':
            safeValue = false;
            break;
        }
        break;
      case 'number':
        safeValue = parseInt(rawValue);
        break;
      case 'string':
        safeValue = rawValue;
        break;
    }

    setTouched(true, false);
    setValue(safeValue);
  };

  const HTMLValue = typeof value === 'boolean' ? value.toString() : value;

  return (
    <RadioGroup selectedValue={HTMLValue} onChange={handleChange} {...props}>
      {children}
    </RadioGroup>
  );
}
