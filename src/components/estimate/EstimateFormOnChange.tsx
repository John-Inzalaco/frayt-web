import { useCallback, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { selectEstimateStatus } from '../../lib/reducers/estimateSlice';
import FormikOnChange, {
  FormikChangeHelpers,
  FormikChangeMeta,
  FormikOnChangeProps,
} from '../form/FormikOnChange';

type EstimateFormChangeProps<V> = FormikOnChangeProps<V>;

export default function EstimateFormOnChange<V>({
  onChange,
  ...props
}: EstimateFormChangeProps<V>) {
  const status = useSelector(selectEstimateStatus);
  const delayedUpdate = useRef<() => void>();
  const handleChange = useCallback(
    (values: V, meta: FormikChangeMeta<V>, actions: FormikChangeHelpers<V>) => {
      if (meta.isValid) {
        if (status === 'loading' || delayedUpdate.current) {
          delayedUpdate.current = () => onChange(values, meta, actions);
        } else {
          onChange(values, meta, actions);
        }
      }
    },
    [status, onChange]
  );

  useEffect(() => {
    if (delayedUpdate.current && status !== 'loading') {
      delayedUpdate.current();
      delayedUpdate.current = undefined;
    }
  }, [status, handleChange]);

  return <FormikOnChange onChange={handleChange} {...props} />;
}
