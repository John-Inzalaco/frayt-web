import { Match } from '../../../lib/actions/MatchAction';
import MatchSummaryControl, {
  MatchSummaryControlProps,
} from './MatchSummaryControl';

type DeliveryNotesSummaryProps = {
  match: Match;
};

function DeliveryNotesSummary({ match: { stops } }: DeliveryNotesSummaryProps) {
  if (stops.length > 1) {
    const count = stops.filter(s => s.delivery_notes).length;
    return <p>{count} stop(s) with notes</p>;
  } else {
    const [{ delivery_notes }] = stops;
    return <p>{delivery_notes}</p>;
  }
}

type DeliverySummaryProps = {
  match: Match;
} & Omit<MatchSummaryControlProps, 'header' | 'children'>;

export default function DeliverySummary({
  match,
  ...props
}: DeliverySummaryProps) {
  const { pickup_notes, po } = match;

  return (
    <MatchSummaryControl header='Delivery' {...props}>
      <div className='oneHalf'>
        <div className='infoBox infoBox--row'>
          <p className='heading'>PO/JOB #</p>
          <p>{po}</p>
        </div>
      </div>
      <div className='oneHalf'>
        <div className='infoBox infoBox--row'>
          <p className='heading'>PICKUP NOTES</p>
          <p>{pickup_notes}</p>
        </div>
        <div className='infoBox infoBox--row'>
          <p className='heading'>DROPOFF NOTES</p>
          <DeliveryNotesSummary match={match} />
        </div>
      </div>
    </MatchSummaryControl>
  );
}
