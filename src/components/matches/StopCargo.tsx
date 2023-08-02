import { MatchStop } from '../../lib/actions/MatchAction';
import { ItemLabel } from '../estimate/ItemLabel';

type StopCargoProps = {
  stop: MatchStop;
};

export default function StopCargo({ stop }: StopCargoProps) {
  return (
    <>
      {stop.items.map(item => {
        return (
          <p key={item.id}>
            <ItemLabel item={item} />
          </p>
        );
      })}
    </>
  );
}
