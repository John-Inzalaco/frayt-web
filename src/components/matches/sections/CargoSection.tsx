import { formatVolume } from '../../../lib/Utility';
import StopCargo from '../StopCargo';
import MatchSectionControl, { MatchSectionProps } from './MatchSectionControl';

export default function CargoSection({
  match,
  isActive,
  showMore,
  goBack,
}: MatchSectionProps) {
  const { total_weight, total_volume, stops, po } = match;
  return (
    <MatchSectionControl
      isActive={isActive}
      goBack={goBack}
      showMore={showMore}
      title='Cargo'
    >
      {isActive ? (
        <>
          <div className='infoBox' key={'po'}>
            <strong>PO / Job #</strong>
            {po}
          </div>
          {stops.map(stop => (
            <div className='infoBox' key={`stop_${stop.index}_items`}>
              <strong>
                {stops.length === 1 ? 'Cargo' : `#${stop.index + 1} Cargo`}
              </strong>
              <StopCargo stop={stop} />
            </div>
          ))}
        </>
      ) : (
        <div className='oneThird'>
          <div className='infoBox infoBox--row'>
            <p className='heading'>WEIGHT</p>
            <p>{total_weight}lbs</p>
          </div>
          <div className='infoBox infoBox--row'>
            <p className='heading'>VOLUME</p>
            <p>{formatVolume(total_volume)} ft&sup3;</p>
          </div>
        </div>
      )}
    </MatchSectionControl>
  );
}
