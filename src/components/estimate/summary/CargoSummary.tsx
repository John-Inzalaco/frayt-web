import { formatVolume } from '../../../lib/Utility';
import { Match } from '../../../lib/actions/MatchAction';
import StopCargo from '../../matches/StopCargo';
import MatchSummaryControl, {
  MatchSummaryControlProps,
} from './MatchSummaryControl';

type CargoSummaryProps = {
  match: Match;
} & Omit<MatchSummaryControlProps, 'header' | 'children'>;

export default function CargoSummary({ match, ...props }: CargoSummaryProps) {
  const { stops, total_weight, total_volume } = match;

  return (
    <MatchSummaryControl header='Cargo' {...props}>
      {stops.length === 1 ? (
        <div className='infoBox infoBox--row'>
          <p className='heading'>ITEMS</p>
          <StopCargo stop={stops[0]} />
        </div>
      ) : (
        <>
          <div className='oneHalf'>
            <div className='infoBox infoBox--row'>
              <p className='heading'>TOTAL WEIGHT</p>
              <p>{total_weight}lbs</p>
            </div>
          </div>
          <div className='oneHalf'>
            <div className='infoBox infoBox--row'>
              <p className='heading'>TOTAL VOLUME</p>
              <p>{formatVolume(total_volume)} ft&sup3;</p>
            </div>
          </div>
        </>
      )}
    </MatchSummaryControl>
  );
}
