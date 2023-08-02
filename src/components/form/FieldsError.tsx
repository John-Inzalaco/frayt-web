import { getIn, useFormikContext } from 'formik';
import FieldError from './FieldError';

type FieldsErrorProps = {
  names: string[];
  ignoreTouched?: boolean;
};

export function FieldsError({ names, ignoreTouched }: FieldsErrorProps) {
  const { errors } = useFormikContext<unknown>();

  const name = names.find(name => getIn(errors, name));

  return name ? <FieldError name={name} ignoreTouched={ignoreTouched} /> : null;
}
