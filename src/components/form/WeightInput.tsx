import { Radio, RadioGroup } from '@blueprintjs/core';
import { Field, useField } from 'formik';
import { BaseSyntheticEvent, useCallback, useEffect, useState } from 'react';
import { CargoStopItemValues } from '../estimate/steps/Cargo';
import DecimalInput from './DecimalInput';

type WeightInputProps = {
  parentName: string;
  name: string;
  currentWeight?: number;
};

export default function WeightInput({ parentName, name }: WeightInputProps) {
  const [{ value: item }, , { setValue }] =
    useField<CargoStopItemValues>(parentName);
  const [displayWeight, setDisplayWeight] = useState<number | undefined>();
  const [weightType, setWeightType] = useState<string | undefined>();
  const { pieces, weight: itemWeight } = item;

  useEffect(() => {
    const weightInfo = JSON.parse(sessionStorage.getItem('weightInfo') || '{}');
    const csvEstimation = weightInfo[`${name}Csv`] === true;
    const defaultType = weightInfo[`${name}Type`] || 'total';
    const weightType = !csvEstimation ? defaultType : 'total';
    const weight = weightInfo[name];

    let w = itemWeight;
    if (csvEstimation && pieces && itemWeight) {
      item.weight = +(itemWeight / pieces).toFixed(2);
      weightInfo[`${name}Csv`] = false;
      sessionStorage.setItem('weightInfo', JSON.stringify(weightInfo));
    } else if (!!weight && weightType === 'total' && pieces) {
      item.weight = +(weight / pieces).toFixed(2);
      w = weight;
    } else if (weightType === 'per_piece') {
      item.weight = weight;
      w = weight;
    }

    setDisplayWeight(w);
    setWeightType(weightType);
  }, [displayWeight, item.pieces, item, name, pieces, itemWeight]);

  const handleWeightChange = useCallback(
    (e: BaseSyntheticEvent) => {
      const w = +e.target.value;
      let itemWeight;
      if (weightType === 'total' && pieces && w) {
        itemWeight = +(w / pieces).toFixed(2);
      } else if (w && weightType === 'per_piece') {
        itemWeight = w;
      }

      const weight = w && Math.round(w) ? Math.round(w) : undefined;
      const weightInfoStr = sessionStorage.getItem('weightInfo') || '{}';
      const weightInfo = JSON.parse(weightInfoStr);
      weightInfo[name] = weight;
      sessionStorage.setItem('weightInfo', JSON.stringify(weightInfo));
      setDisplayWeight(weight);
      setValue({ ...item, weight: itemWeight });
    },
    [item, name, pieces, setValue, weightType]
  );

  const handleWeightTypeChange = useCallback(
    (e: BaseSyntheticEvent) => {
      const weightInfo = JSON.parse(
        sessionStorage.getItem('weightInfo') || '{}'
      );
      weightInfo[`${name}Type`] = e.target.value;
      weightInfo[name] = undefined;
      sessionStorage.setItem('weightInfo', JSON.stringify(weightInfo));
      setValue({ ...item, weight: undefined });
      setDisplayWeight(undefined);
      setWeightType(e.target.value);
    },
    [item, name, setValue]
  );

  return (
    <>
      <RadioGroup
        label='WEIGHT'
        onChange={handleWeightTypeChange}
        selectedValue={weightType}
      >
        <Radio
          label='Total'
          className='u-display__inline-block'
          value={'total'}
        />
        &nbsp; &nbsp; &nbsp;
        <Radio
          label='Per Piece'
          className='u-display__inline-block'
          value={'per_piece'}
        />
      </RadioGroup>
      <DecimalInput
        name={`per-piece-weight-${name}`}
        label=''
        value={`${displayWeight}`}
        onChange={handleWeightChange}
        decimals={0}
        type='number'
        ignoreTouched={false}
        placeholder='lbs'
        disabled={!item.pieces && weightType === 'total'}
      />
      <Field type={'hidden'} name={name} value={item.weight?.toFixed(2)} />
    </>
  );
}
