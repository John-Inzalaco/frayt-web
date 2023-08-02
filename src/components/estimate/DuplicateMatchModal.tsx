import {
  Button,
  ButtonProps,
  PopoverInteractionKind,
  Position,
} from '@blueprintjs/core';
import { Classes, Popover2 } from '@blueprintjs/popover2';
import { createRef, useState } from 'react';
import { Match } from '../../lib/actions/MatchAction';
import { resetEstimate } from '../../lib/reducers/estimateSlice';
import { useAppDispatch } from '../../lib/store';
import DuplicateMatchForm from './DuplicateMatchForm';

type DuplicateMatchProps = {
  match: Match;
  style: React.CSSProperties;
} & ButtonProps<HTMLButtonElement>;

export default function DuplicateMatchModal({
  match,
  className,
  ...props
}: DuplicateMatchProps) {
  const ref = createRef<HTMLElement>();
  const dispatch = useAppDispatch();
  const [modalOpen, setModalOpen] = useState(false);
  const toggleModal = () => {
    dispatch(resetEstimate());
    setModalOpen(!modalOpen);
  };

  className = className || '';

  if (modalOpen) {
    className += ' active';
  }

  return (
    <Popover2
      interactionKind={PopoverInteractionKind.CLICK}
      popoverClassName={`DuplicateMatch__modal ${Classes.POPOVER2_CONTENT_SIZING}`}
      position={Position.LEFT}
      className='DuplicateMatch'
      isOpen={modalOpen}
      popoverRef={ref}
      fill
      content={
        <div>
          <h3>Duplicate Match #{match.shortcode}</h3>
          <DuplicateMatchForm match={match} onDone={toggleModal} />
        </div>
      }
    >
      <Button className={className} {...props} onClick={toggleModal}>
        Duplicate
      </Button>
    </Popover2>
  );
}
