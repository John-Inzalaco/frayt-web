import { Link } from 'react-router-dom';
import { Button, Icon } from '@blueprintjs/core';
import {
  formatVehicle,
  formatAddress,
  formatDistance,
  formatMatchStatus,
  formatCurrentStateTime,
} from '../../lib/Utility';
import DuplicateMatchModal from '../estimate/DuplicateMatchModal';
import { Match } from '../../lib/actions/MatchAction';
import ShipperLabel from '../shippers/ShipperLabel';

type MatchListItemProps = {
  match?: Match | null;
  loading?: boolean;
};

export default function MatchListItem({ match, loading }: MatchListItemProps) {
  let loadingClass = '';

  if (loading) {
    loadingClass = ' bp4-skeleton';
  }

  const {
    id,
    origin_address,
    state,
    total_price,
    total_distance,
    vehicle_class,
    po,
    shortcode,
    stops,
  } = match || {};

  const matchLink = '/matches/' + id;

  return (
    <div className='matchRow'>
      <div className='matchRow__container'>
        <div className='matchRow__subrow'>
          <div className='matchRow__category matchRow--header'>
            <p className='matchRow__label'>PICKUP</p>
            <h3 className={loadingClass}>
              {formatAddress(origin_address?.formatted_address)}
            </h3>
          </div>
          <div className='matchRow__category matchRow--header'>
            <p className='matchRow__label'>DROPOFF</p>
            <h3 className={loadingClass}>
              {stops?.length === 1
                ? formatAddress(stops[0].destination_address.formatted_address)
                : `${stops?.length || 0 + 1} Stops`}
            </h3>
          </div>
        </div>
        <div className='matchRow__subrow'>
          <div className='matchRow__category matchRow__category--large'>
            <p className='matchRow__label'>
              <Icon icon='pulse' iconSize={11} className='matchRow__icon' />
              STATUS
            </p>
            <h3 className={loadingClass}>
              {state && formatMatchStatus(state)}
            </h3>
          </div>
          <div className='matchRow__category'>
            <p className='matchRow__label'>
              <Icon icon='dollar' iconSize={11} className='matchRow__icon' />
              PRICE
            </p>
            <h3 className={loadingClass}>${total_price}</h3>
          </div>
          <div className='matchRow__category'>
            <p className='matchRow__label'>
              <Icon
                icon='send-to-map'
                iconSize={11}
                className='matchRow__icon'
              />
              DISTANCE
            </p>
            <h3 className={loadingClass}>{formatDistance(total_distance)}</h3>
          </div>
          <div className='matchRow__category matchRow__category--large'>
            <p className='matchRow__label'>
              <Icon
                icon='drive-time'
                iconSize={11}
                className='matchRow__icon'
              />
              VEHICLE
            </p>
            <h3 className={loadingClass}>
              {vehicle_class && formatVehicle(vehicle_class)}
            </h3>
          </div>
        </div>
        <div className='matchRow__subrow'>
          <div className='matchRow__category'>
            <p className='matchRow__label'>
              <Icon icon='comment' iconSize={11} className='matchRow__icon' />
              PO/JOB #
            </p>
            <h3 className={loadingClass}>{po ? po : 'N/A'}</h3>
          </div>
        </div>
      </div>
      <div className='matchRow__container'>
        <div className='matchRow__info'>
          <h4 className={'matchRow__details' + loadingClass}>
            Match #{shortcode}
          </h4>
          <p className={'matchRow__details' + loadingClass}>
            {match && formatCurrentStateTime(match)}
          </p>
          {match?.shipper && (
            <p className={'matchRow__details' + loadingClass}>
              Placed by <ShipperLabel shipper={match.shipper} />
            </p>
          )}
        </div>
        <div className='matchRow__action'>
          <Link to={matchLink}>
            <Button
              type='button'
              rightIcon='arrow-right'
              className={
                'actionButton' + loadingClass + ' matchRow__actionButton'
              }
              alignText='left'
              style={{ minWidth: 175 }}
            >
              Match Details
            </Button>
          </Link>
          {match && (
            <DuplicateMatchModal
              match={match}
              className='actionButton matchRow__actionButton'
              alignText='left'
              rightIcon='duplicate'
              style={{ minWidth: 175 }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
