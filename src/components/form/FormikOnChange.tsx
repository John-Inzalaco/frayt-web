import { FormikErrors, FormikHelpers, useFormikContext } from 'formik';
import { useCallback, useEffect } from 'react';
import { useDebouncer, usePrevious } from '../../lib/Hooks';

export type FormikChangeMeta<V> = {
  errors: FormikErrors<V>;
  isValid: boolean;
  isValidating: boolean;
  prevValues?: V;
};

export type FormikChangeHelpers<V> = Pick<FormikHelpers<V>, 'setSubmitting'>;

export type FormikOnChangeProps<V> = {
  onChange: (
    values: V,
    meta: FormikChangeMeta<V>,
    actions: FormikChangeHelpers<V>
  ) => Promise<void> | void;
  changeDelay?: number;
};

export default function FormikOnChange<V>({
  onChange,
  changeDelay,
}: FormikOnChangeProps<V>) {
  const {
    values,
    errors,
    isValid,
    isValidating,
    setSubmitting,
    initialTouched,
    touched,
  } = useFormikContext<V>();
  const prevValues = usePrevious(values);
  const prevValid = usePrevious(isValid);
  const [debounce] = useDebouncer(changeDelay || 500);

  const handleChange = useCallback(async () => {
    await onChange(
      values,
      { prevValues, errors, isValid, isValidating },
      { setSubmitting }
    );
  }, [
    values,
    prevValues,
    errors,
    isValid,
    isValidating,
    onChange,
    setSubmitting,
  ]);

  useEffect(() => {
    if (
      (values !== prevValues || isValid !== prevValid) &&
      initialTouched !== touched
    ) {
      setSubmitting(true);

      debounce(() => {
        setSubmitting(false);
        handleChange();
      });
    }
  }, [
    values,
    prevValues,
    initialTouched,
    touched,
    isValid,
    prevValid,
    changeDelay,
    debounce,
    handleChange,
    setSubmitting,
  ]);

  return null;
}
