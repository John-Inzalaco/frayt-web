import { Button, Collapse, Icon } from '@blueprintjs/core';
import { useField } from 'formik';
import { useEffect, useState } from 'react';
import { CargoStopItemValues } from './steps/Cargo';

import ItemFormGroup from './ItemFormGroup';
import { ItemLabel } from './ItemLabel';

type ItemRepeaterItemProps = {
  name: string;
  required: boolean;
  removeItem: () => void;
};

export default function ItemRepeaterItem({
  name,
  removeItem,
  required,
}: ItemRepeaterItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [{ value: item }, { error }] = useField<CargoStopItemValues>(name);
  const isValid = !error;

  useEffect(() => {
    if (!isValid && !isOpen) setIsOpen(true);
  }, [isValid, isOpen, setIsOpen]);

  return (
    <div className='item'>
      <div className='item-label'>
        <button
          className='toggle-item compact-button'
          disabled={!isValid}
          onClick={() => setIsOpen(true)}
        >
          <Icon icon='edit' />
        </button>
        <ItemLabel item={item} />
        <button
          disabled={required}
          className='remove-item compact-button'
          onClick={removeItem}
        >
          <Icon icon='trash' />
        </button>
      </div>

      <Collapse isOpen={isOpen}>
        <ItemFormGroup name={name} />
        <Button
          className='toggle-item done-button'
          disabled={!isValid}
          onClick={() => setIsOpen(false)}
        >
          Done
        </Button>
      </Collapse>
    </div>
  );
}
