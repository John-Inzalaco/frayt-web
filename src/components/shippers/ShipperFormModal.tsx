import React, { useState } from 'react';
import { Popover2, Classes, Popover2Props } from '@blueprintjs/popover2';
import ShipperForm from './ShipperForm';
import { Button } from '@blueprintjs/core';
import { Shipper } from '../../lib/actions/ShipperAction';

export type ShipperFormModalProps = {
  title: string;
  submitLabel: React.ReactNode;
  button: React.ReactNode;
  shipper?: Shipper;
} & Popover2Props;

export default function ShipperFormModal({
  title,
  submitLabel,
  button,
  shipper,
  ...props
}: ShipperFormModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Popover2
      isOpen={isOpen}
      popoverClassName={`popover--color__gray popover--size__md ${Classes.POPOVER2_CONTENT_SIZING}`}
      onInteraction={setIsOpen}
      content={
        <div>
          <h3>{title}</h3>
          <ShipperForm
            submitLabel={submitLabel}
            onSubmit={() => setIsOpen(false)}
            shipper={shipper}
            actions={
              <Button
                className={`u-text__right ${Classes.POPOVER2_DISMISS}`}
                text='Cancel'
                type='button'
              />
            }
          />
        </div>
      }
      {...props}
    >
      {button}
    </Popover2>
  );
}
