import { Button, Icon, Position, Spinner } from '@blueprintjs/core';
import { useSelector } from 'react-redux';
import { Shipper } from '../../lib/actions/ShipperAction';
import { selectShippersStatus } from '../../lib/reducers/shippersSlice';
import ShipperFormModal from './ShipperFormModal';
import ShipperListItem from './ShipperListItem';

type ShippersListProps = {
  shippers: Shipper[];
  showRole: boolean;
};

export default function ShippersList({
  shippers,
  showRole,
}: ShippersListProps) {
  const status = useSelector(selectShippersStatus);
  return (
    <table className='bp4-html-table'>
      <thead>
        <tr>
          <th>Name</th>
          <th className='mobile-hidden'>Role</th>
          {showRole && <th className='mobile-hidden'>Location</th>}
          <th>Email</th>
          <th>
            <ShipperFormModal
              title='Invite Shipper'
              submitLabel='Invite'
              position={Position.LEFT_TOP}
              button={
                <Button>
                  <Icon icon='plus' />
                </Button>
              }
            />
          </th>
        </tr>
      </thead>
      <tbody>
        {shippers.length > 0 ? (
          shippers.map(shipper => (
            <ShipperListItem
              key={shipper.id}
              shipper={shipper}
              showRole={showRole}
            />
          ))
        ) : (
          <tr>
            <td colSpan={showRole ? 5 : 4}>
              {status === 'loading' ? (
                <Spinner size={40} />
              ) : (
                <h2>No results found</h2>
              )}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
