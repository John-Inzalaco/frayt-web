import { Icon } from '@blueprintjs/core';
import { useFieldArray } from '../form/FieldArray';
import ItemRepeaterItem from './ItemRepeaterItem';
import { buildCargoStopItemValues, CargoStopItemValues } from './steps/Cargo';

type ItemsRepeaterProps = {
  stopIndex: number;
};

export default function ItemsRepeater({ stopIndex }: ItemsRepeaterProps) {
  const name = `stops[${stopIndex}]items`;
  const [{ value: items }, , { remove, push }] =
    useFieldArray<CargoStopItemValues>(name);

  const addItem = () => {
    const item = buildCargoStopItemValues();
    push(item);
  };

  return (
    <div className='items'>
      <div className='items-header'>
        <h3>Items</h3>
        <button className='add-item compact-button' onClick={addItem}>
          <Icon icon='plus' />
        </button>
      </div>
      {items.map((item, index) => (
        <ItemRepeaterItem
          key={item.id}
          removeItem={() => remove(index)}
          name={`${name}[${index}]`}
          required={index === 0}
        />
      ))}
    </div>
  );
}
