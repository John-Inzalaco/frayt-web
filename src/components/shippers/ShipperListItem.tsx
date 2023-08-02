import { Button, Icon, Position } from '@blueprintjs/core';
import { Classes, Popover2 } from '@blueprintjs/popover2';
import { useState } from 'react';
import { Shipper, ShipperState } from '../../lib/actions/ShipperAction';
import { updateShipper } from '../../lib/reducers/shippersSlice';
import { useAppDispatch } from '../../lib/store';
import ShipperFormModal from './ShipperFormModal';

type ShipperListItemProps = {
  showRole: boolean;
  shipper?: Shipper;
  loading?: boolean;
};

export default function ShipperListItem({
  shipper,
  showRole,
  loading,
}: ShipperListItemProps) {
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);

  const toggleShipperDisabled = () => {
    if (shipper) {
      const state =
        shipper.state === ShipperState.Approved
          ? ShipperState.Disabled
          : ShipperState.Approved;
      dispatch(updateShipper([shipper.id, { state }]));

      setIsOpen(false);
    }
  };

  const loadingClass = `${loading && 'bp4-skeleton'}`;

  return (
    <tr
      className={`ShipperList__item ${
        shipper?.state === ShipperState.Disabled && 'disabled'
      }`}
    >
      <td className={loadingClass}>
        {shipper?.first_name} {shipper?.last_name || '...'}
      </td>
      <td className={`mobile-hidden ${loadingClass}`}>
        {shipper?.role_label}{' '}
      </td>
      {showRole && (
        <td className={`mobile-hidden ${loadingClass}`}>
          {shipper?.location?.name}{' '}
        </td>
      )}
      <td className={`${loadingClass}`}>{shipper?.email} </td>
      <td>
        {!loading && shipper && (
          <>
            <ShipperFormModal
              title={`Edit ${shipper.first_name} ${shipper.last_name}`}
              submitLabel='Update'
              shipper={shipper}
              button={
                <Button>
                  <Icon icon='edit' />
                </Button>
              }
            />{' '}
            <Popover2
              isOpen={isOpen}
              onInteraction={setIsOpen}
              popoverClassName={Classes.POPOVER2_CONTENT_SIZING}
              position={Position.LEFT}
              content={
                <div>
                  <p>
                    Do you want to
                    {shipper.state === ShipperState.Disabled
                      ? 'enable'
                      : 'disable'}{' '}
                    <b>
                      {shipper.first_name} {shipper.last_name}
                    </b>
                    ?{' '}
                    {shipper.state === ShipperState.Disabled &&
                      'This shipper will be unable to place matches or access their account.'}
                  </p>{' '}
                  <Button
                    intent={
                      shipper.state === ShipperState.Disabled
                        ? 'success'
                        : 'danger'
                    }
                    text={
                      shipper.state === ShipperState.Disabled
                        ? 'Enable'
                        : 'Disable'
                    }
                    onClick={toggleShipperDisabled}
                  />
                  <Button
                    className={`${Classes.POPOVER2_DISMISS} u-text__right`}
                    text='Cancel'
                  />
                </div>
              }
            >
              <Button
                intent={
                  shipper.state === ShipperState.Disabled ? 'success' : 'danger'
                }
                outlined
              >
                <Icon
                  icon={
                    shipper.state === ShipperState.Disabled ? 'tick' : 'disable'
                  }
                />
              </Button>
            </Popover2>
          </>
        )}
      </td>
    </tr>
  );
}
