import { useField } from 'formik';

type FieldErrorProps = {
  name: string;
  ignoreTouched?: boolean;
  className?: string;
};

export default function FieldError({
  name,
  ignoreTouched,
  className,
}: FieldErrorProps) {
  const [, { touched, error }] = useField(name);

  return (touched || ignoreTouched) && error ? (
    <p className={`error ${className ? className : ''}`}>{error}</p>
  ) : null;
}
