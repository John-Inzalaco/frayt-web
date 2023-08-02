import { InputGroupProps } from '@blueprintjs/core';
import DecimalInput from './DecimalInput';

type MoneyInputProps = {
  name: string;
  label: string;
  ignoreTouched: boolean;
} & InputGroupProps;

export default function MoneyInput({ name, label, ...props }: MoneyInputProps) {
  return (
    <DecimalInput
      name={name}
      label={label}
      decimals={2}
      multipler={100}
      {...props}
    />
  );
}
