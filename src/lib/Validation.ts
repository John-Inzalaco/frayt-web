import { isValidPhoneNumber } from 'react-phone-number-input';

export function NaNtoEmpty(_: unknown, value: number | null | undefined) {
  return value || value === 0 ? Number(value) : undefined;
}

export function validPhoneNumber(value: string | null | undefined) {
  if (value) {
    return isValidPhoneNumber(value);
  }

  return true;
}
