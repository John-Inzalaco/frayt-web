import { MatchStop } from '../../../lib/actions/MatchAction';
import MatchSectionControl, { MatchSectionProps } from './MatchSectionControl';

type StopNotesProps = {
  stop: MatchStop;
};
function StopNotes({
  stop: { index, delivery_notes, recipient, self_recipient },
}: StopNotesProps) {
  return (
    <div className='infoBox' key={`stop-notes-${index}`}>
      <p className='heading'>#{index + 1} STOP</p>
      <strong>NOTES</strong>
      <p>{delivery_notes || 'N/A'}</p>
      <br />
      <strong>RECIPIENT</strong>
      <p>
        {!self_recipient && recipient
          ? recipient.name +
            (recipient.phone_number ? ` (${recipient.phone_number})` : '')
          : 'No Recipient'}
      </p>
    </div>
  );
}

export default function DeliveryNotesSection({
  match,
  isActive,
  showMore,
  goBack,
}: MatchSectionProps) {
  return (
    <MatchSectionControl
      isActive={isActive}
      goBack={goBack}
      showMore={showMore}
      title='Delivery Notes'
    >
      {isActive && (
        <>
          <div className='infoBox'>
            <p className='heading'>PICKUP NOTES</p>
            <p>{match.pickup_notes || 'N/A'}</p>
          </div>

          {match.stops.map(stop => (
            <StopNotes key={stop.id} stop={stop} />
          ))}
        </>
      )}
    </MatchSectionControl>
  );
}
