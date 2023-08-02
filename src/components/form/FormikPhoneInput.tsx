import { useField } from 'formik';
import PhoneInput from 'react-phone-number-input';

type PhoneInputProps = React.ComponentProps<typeof PhoneInput>;

type FormikPhoneInputProps = {
  name: string;
} & Omit<PhoneInputProps, 'value' | 'onChange'>;

type E164Number = PhoneInputProps['value'];

export default function FormikPhoneInput({
  name,
  ...props
}: FormikPhoneInputProps) {
  const [{ onChange, value, ...rest }, , { setValue }] = useField<
    string | undefined | null
  >(name);

  const handleChange = (value: E164Number) => {
    setValue(value);
  };

  return (
    <PhoneInput
      onChange={handleChange}
      value={value || ''}
      {...rest}
      {...props}
    />
  );
}
