import { useSelector } from 'react-redux';
import { Shipper } from '../../lib/actions/ShipperAction';
import { selectUser } from '../../lib/reducers/userSlice';

type ShipperLabelProps = {
  shipper: Shipper;
};

export default function ShipperLabel({
  shipper: { id, first_name, last_name, email },
}: ShipperLabelProps) {
  const user = useSelector(selectUser);
  return (
    <span className='shipper-label'>
      {id === user?.id ? (
        'Me'
      ) : (
        <>
          <span>
            {first_name} {last_name}
          </span>
          <br />
          <span className='shipper-label__email'>({email})</span>
        </>
      )}
    </span>
  );
}
