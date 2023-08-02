import ServiceToggle from './ServiceToggle';
import { useField, useFormikContext } from 'formik';
import { EstimateValues } from './steps/Estimate';
import { useEffect } from 'react';
import { CargoStopValues } from './steps/Cargo';
import { flushSync } from 'react-dom';

type PalletJackToggleProps = {
  disabled?: boolean;
  name: string;
};

export default function PalletJackToggle({
  disabled,
  name,
}: PalletJackToggleProps) {
  const {
    values: { unload_method },
  } = useFormikContext<EstimateValues>();
  const fieldName = `${name}.needs_pallet_jack`;
  const [{ value: stop }] = useField<CargoStopValues>(name);
  const [{ value }, , { setValue }] = useField(fieldName);
  const hasPallets = stop.items.some(({ type }) => type === 'pallet');
  const required = unload_method === 'lift_gate';

  useEffect(() => {
    if (!hasPallets && value) {
      flushSync(() => setValue(false));
    } else if (hasPallets && !value && required) {
      flushSync(() => setValue(true));
    }
  }, [value, hasPallets, required, setValue]);

  return (
    <ServiceToggle
      label='Pallet Jack'
      name={fieldName}
      fee_type='pallet_fee'
      disabled={disabled || !hasPallets || required}
    >
      {unload_method === 'lift_gate'
        ? 'Required for unloading pallets when the driver is using a lift gate. The first 3 pallets are covered. There is an additional fee for each pallet above this.'
        : 'Required if the driver will need a pallet jack for the cargo to be loaded and unloaded'}
    </ServiceToggle>
  );
}
