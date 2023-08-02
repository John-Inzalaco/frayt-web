import { Label } from '@blueprintjs/core';
import { useField } from 'formik';
import { useEffect } from 'react';
import { flushSync } from 'react-dom';
import { formatVolume } from '../../lib/Utility';
import DecimalInput from '../form/DecimalInput';
import { CargoStopItemValues } from './steps/Cargo';

type VolumeInputProps = {
  name: string;
  item: CargoStopItemValues;
};

export default function VolumeInput({ name, item }: VolumeInputProps) {
  const [{ value }, , { setValue, setTouched }] =
    useField<CargoStopItemValues['volume']>(name);

  const pieces = item.pieces ? Number(item.pieces) : undefined;

  const totalVolume =
    typeof value === 'number' && (pieces || pieces === 0)
      ? formatVolume(value * pieces, 2) + ' ft³'
      : 'N/A';

  const useDimensions = !!(item.width || item.length || item.height);
  useEffect(() => {
    if (useDimensions) {
      if (item.width && item.length && item.height) {
        const volume = item.width * item.length * item.height;
        if (volume !== value) {
          flushSync(() => {
            setTouched(true, false);
            setValue(volume);
          });
        }
      } else {
        if (value) flushSync(() => setValue(undefined));
      }
    }
  }, [item, useDimensions, value, setValue, setTouched]);

  return (
    <DecimalInput
      name={name}
      label='VOLUME (ft³)'
      decimals={2}
      multipler={1728}
      disabled={useDimensions}
    >
      <Label>
        <strong>All Pieces:</strong> {totalVolume}
      </Label>
    </DecimalInput>
  );
}
