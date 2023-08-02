import { MatchStopItem } from '../../lib/actions/MatchAction';
import { CargoStopItemValues } from './steps/Cargo';

type ItemLabelProps = {
  item: MatchStopItem | CargoStopItemValues;
};

export function ItemLabel({
  item: { description, pieces, weight, width, length, height, type },
}: ItemLabelProps) {
  let label;
  if (description) {
    label = `${pieces || ''} ${description} ${
      type === 'pallet' ? 'pallet(s)' : ''
    } @ ${weight?.toFixed(2) || '?'}lbs each`;
  } else if (width || length || height || weight) {
    label = `${pieces || '?'} ${type}(s) @ ${width || '?'}x${length || '?'}x${
      height || '?'
    } @ ${weight?.toFixed(2) || '?'}lbs each`;
  } else {
    label = '(no details provided)';
  }

  return <span className='item-desc'>{label}</span>;
}
