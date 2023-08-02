import { Checkbox, Icon } from '@blueprintjs/core';
import { FormEvent } from 'react';
import { useField } from 'formik';
import { MatchStopItemType } from '../../lib/actions/MatchAction';
type ItemTypeToggleProps = {
  name: string;
  disabled?: boolean;
};

export default function ItemTypeToggle({
  name,
  disabled,
}: ItemTypeToggleProps) {
  const [{ value, onChange, ...props }, , { setValue, setTouched }] =
    useField<MatchStopItemType>(name);

  const handleChange = (e: FormEvent<HTMLInputElement>) => {
    const value = e.currentTarget.checked
      ? MatchStopItemType.Pallet
      : MatchStopItemType.Item;

    setTouched(true, false);
    setValue(value);
  };

  return (
    <Checkbox
      checked={value === MatchStopItemType.Pallet}
      onChange={handleChange}
      disabled={disabled}
      {...props}
    >
      <Icon icon='box' style={{ marginRight: 5 }} />
      <strong>Is Pallet</strong>
    </Checkbox>
  );
}
