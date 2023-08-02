import { useField } from 'formik';
import { useEffect } from 'react';
import { flushSync } from 'react-dom';
import ServiceToggle from './ServiceToggle';
import { CargoStopValues } from './steps/Cargo';

type LoadUnloadToggleProps = {
  disabled?: boolean;
  name: string;
};

export default function LoadUnloadToggle({
  name,
  disabled,
}: LoadUnloadToggleProps) {
  const fieldName = `${name}.has_load_fee`;
  const [{ value: stop }] = useField<CargoStopValues>(name);
  const [{ value }, , { setValue }] = useField(fieldName);
  const hasItems = stop.items.some(({ type }) => type === 'item');

  useEffect(() => {
    if (!hasItems && value) flushSync(() => setValue(false));
  }, [value, hasItems, setValue]);

  return (
    <ServiceToggle
      label='Load/Unload'
      name={fieldName}
      fee_type='load_fee'
      disabled={disabled || !hasItems}
    >
      Required if the driver will need to assist loading or unloading non-pallet
      items. The price is based on the total weight.
    </ServiceToggle>
  );
}
