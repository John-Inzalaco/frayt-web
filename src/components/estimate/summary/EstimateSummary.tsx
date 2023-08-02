import {
  formatAddress,
  formatVehicle,
  formatVehicleImage,
} from '../../../lib/Utility';
import { Icon } from '@blueprintjs/core';
import { Match } from '../../../lib/actions/MatchAction';
import MatchSummaryControl, {
  MatchSummaryControlProps,
} from './MatchSummaryControl';
import DateTimeCard from '../../DateTimeCard';
import MatchDiscount from '../MatchDiscount';

type StopsSummaryProps = {
  match: Match;
};

function StopsSummary({
  match: { stops, dropoff_at, timezone },
}: StopsSummaryProps) {
  if (stops.length > 1) {
    return (
      <div className='infoBox--dataHalf'>
        <p>{stops.length} Stops</p>
        <DateTimeCard dateTime={dropoff_at} timezone={timezone} />
      </div>
    );
  } else {
    const [{ destination_address }] = stops;
    return (
      <div className='infoBox--dataHalf'>
        <p>
          {destination_address
            ? formatAddress(destination_address.formatted_address)
            : ''}
        </p>
        <DateTimeCard dateTime={dropoff_at} timezone={timezone} />
      </div>
    );
  }
}

type EstimateSummaryProps = {
  match: Match;
} & Omit<MatchSummaryControlProps, 'header' | 'children' | 'info'>;
export default function EstimateSummary({
  match,
  ...props
}: EstimateSummaryProps) {
  const {
    origin_address,
    pickup_at,
    vehicle_class,
    total_distance,
    timezone,
    total_price,
  } = match;

  const vehicleName = formatVehicle(vehicle_class);

  return (
    <MatchSummaryControl
      header={`Price $${total_price}`}
      info={<MatchDiscount match={match} />}
      {...props}
    >
      <div className='oneHalfDesktop mobileSmallPad'>
        <div className='infoBox infoBox--center infoBox--row infoBox--bold'>
          <img src={formatVehicleImage(vehicle_class)} alt={vehicleName} />
          <p>{vehicleName}</p>
        </div>
        <div className='infoBox infoBox--center infoBox--row infoBox--bold'>
          <img src='/img/icons/route.png' alt='Distance' />
          <p>{total_distance && total_distance.toFixed(1)} mi</p>
        </div>
      </div>
      PICKUP
      <div className='infoBox infoBox--icon'>
        <div className='infoBox--iconHalf'>
          <Icon icon='arrow-up' iconSize={20} className='infoBox__icon' />
        </div>
        <div className='infoBox--dataHalf'>
          <p>
            {origin_address
              ? formatAddress(origin_address.formatted_address)
              : ''}
          </p>
          <DateTimeCard dateTime={pickup_at} timezone={timezone} />
        </div>
      </div>
      DROPOFF
      <div className='infoBox infoBox--icon'>
        <div className='infoBox--iconHalf'>
          <Icon icon='arrow-down' iconSize={20} className='infoBox__icon' />
        </div>
        <StopsSummary match={match} />
      </div>
    </MatchSummaryControl>
  );
}
