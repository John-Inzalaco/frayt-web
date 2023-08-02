import { useState, useEffect } from 'react';
import { Card, Icon, ProgressBar, Button, MenuItem } from '@blueprintjs/core';
import { Select2, ItemRenderer } from '@blueprintjs/select';
import { useSelector } from 'react-redux';
import {
  Driver,
  Match,
  MatchState,
  updatePreferredDriverById,
} from '../../../lib/actions/MatchAction';
import { selectUser } from '../../../lib/reducers/userSlice';
import {
  chunkArray,
  formatAddress,
  formatDateSuccinct,
  formatDateVerbose,
  formatDistance,
  formatMatchProgress,
  formatMatchStatus,
  formatPhoneNumberSimplify,
  formatTime,
  formatVehicle,
  matchInState,
} from '../../../lib/Utility';
import DateTimeCard from '../../DateTimeCard';
import { fetchMatch } from '../../../lib/reducers/matchesSlice';
import { useAppDispatch } from '../../../lib/store';
import { getInteractedDrivers } from '../../../lib/actions/UserAction';

type MatchStopDetailsProps = {
  match: Match;
};

function MatchStopDetails({
  match: { stops, dropoff_at, timezone },
}: MatchStopDetailsProps) {
  if (stops.length === 1) {
    const [{ destination_address }] = stops;
    return (
      <div>
        <p className='statusDescription'>DROPOFF </p>
        {destination_address.name && <h2>{destination_address.name}</h2>}
        <h2>{formatAddress(destination_address.formatted_address)}</h2>
        <DateTimeCard dateTime={dropoff_at} timezone={timezone} />
      </div>
    );
  } else {
    return (
      <div>
        <p className='statusDescription'>STOPS </p>
        <ol className='stopList'>
          {stops.map(({ id, destination_address, dropoff_by, state }) => (
            <li key={`stop-${id}-dropoff-by`}>
              {destination_address.name && <h2>{destination_address.name}</h2>}
              <h2>
                {formatAddress(destination_address.formatted_address)}
                <span className={`label label__state--${state} large`}>
                  {state}
                </span>
              </h2>
              <DateTimeCard dateTime={dropoff_by} timezone={timezone} />
            </li>
          ))}
        </ol>
      </div>
    );
  }
}

type MatchTimestampsProps = {
  match: Match;
};

function MatchTimestamps({ match }: MatchTimestampsProps) {
  const timestamps = matchInState(match, [
    MatchState.Canceled,
    MatchState.AdminCanceled,
  ])
    ? [{ title: 'CANCELED AT', timestamp: match.canceled_at }]
    : [
        { title: 'ACTIVATED AT', timestamp: match.activated_at },
        { title: 'ACCEPTED AT', timestamp: match.accepted_at },
        { title: 'PICKED UP AT', timestamp: match.picked_up_at },
        { title: 'COMPLETED AT', timestamp: match.completed_at },
      ];

  return (
    <>
      {chunkArray(timestamps, 2).map((timestamps, index) => (
        <div className='cardThreeColumn' key={index}>
          {timestamps.map(({ title, timestamp }, index) => (
            <div className='cardInset' key={index}>
              <div className='cardInset--data'>
                <p className='statusDescription'>{title}</p>
                {timestamp ? (
                  <>
                    <h2>{formatTime(timestamp, match.timezone)}</h2>
                    <p>{formatDateSuccinct(timestamp, match.timezone)}</p>
                  </>
                ) : (
                  <h2>-</h2>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}
    </>
  );
}

type DetailsPanelProps = {
  match: Match;
  isActive: boolean;
};

const renderItem: ItemRenderer<Driver> = (
  driver,
  { handleClick, handleFocus, modifiers }
) => {
  if (!modifiers.matchesPredicate) {
    return null;
  }
  return (
    <MenuItem
      active={modifiers.active}
      disabled={modifiers.disabled}
      key={driver.id}
      onClick={handleClick}
      onFocus={handleFocus}
      roleStructure='listoption'
      text={`${driver?.first_name} ${driver?.last_name}`}
    />
  );
};

export default function DetailsSection({ match, isActive }: DetailsPanelProps) {
  const user = useSelector(selectUser);
  const { driver, shipper } = match;
  const progress = formatMatchProgress(match);
  const dispatch = useAppDispatch();

  const preferred_driver_id = match.preferred_driver?.id;

  const [selected, setSelected] = useState<Driver>();

  const [drivers, setDrivers] = useState<Driver[]>();

  const handleAnyDriver = async () => {
    const response = await updatePreferredDriverById(match.id, {
      platform: 'marketplace',
      preferred_driver_id: null,
    });
    if (response?.status === 200) {
      await dispatch(fetchMatch(match.id));
    }
  };

  useEffect(() => {
    const getMatches = async () => {
      const {
        data: { data: drivers },
      } = await getInteractedDrivers();

      setDrivers(
        drivers.filter(
          (fetched_driver: Driver) =>
            fetched_driver.id !== preferred_driver_id &&
            fetched_driver.id !== match.driver?.id
        )
      );
    };

    getMatches();
  }, [match, preferred_driver_id]);

  useEffect(() => {
    if (selected)
      updatePreferredDriverById(match.id, {
        preferred_driver_id: selected.id,
      });
  }, [selected, match]);

  return isActive ? (
    <Card interactive={false}>
      <p className='statusDescription'>CURRENT STATUS</p>
      {match.platform === 'deliver_pro' ? (
        match.preferred_driver ? (
          <h2 data-testid='current_status'>
            {formatMatchStatus(match.state) === 'Assigning Driver' &&
            match.preferred_driver
              ? 'Awaiting Preferred Driver'
              : formatMatchStatus(match.state)}
          </h2>
        ) : (
          <h2 data-testid='current_status'>Preferred Driver Unavailable</h2>
        )
      ) : match.stops.length === 1 && match.stops[0].state === 'returned' ? (
        <h2 data-testid='current_status'>Returned</h2>
      ) : (
        <h2 data-testid='current_status'>{formatMatchStatus(match.state)}</h2>
      )}

      <ProgressBar
        intent={progress.intent}
        value={progress.value}
        stripes={progress.stripes}
      />

      {match.platform === 'deliver_pro' && (
        <div className='preferred-container'>
          <div className='cardInset'>
            <div className='cardInset--icon'>
              <Icon icon='person' iconSize={20} />
            </div>
            <div className='cardInset--data'>
              <p className='statusDescription'>PREFERRED DRIVER</p>
              {match.origin_address.name && (
                <h2>{match.origin_address.name}</h2>
              )}
              {match.state === 'assigning_driver' && preferred_driver_id ? (
                <h2>
                  Your chosen driver has been sent a notification for this
                  order.
                </h2>
              ) : match.platform === 'deliver_pro' &&
                preferred_driver_id === undefined ? (
                <h2>
                  Your preferred driver is not available. What do you want to
                  do?
                </h2>
              ) : null}
            </div>
          </div>
          <div className='cardInset driver-options-container'>
            <div className='cardOption'>
              <Select2
                className='cardInset--select'
                items={drivers || []}
                itemRenderer={renderItem}
                onItemSelect={setSelected}
                filterable={false}
                scrollToActiveItem={true}
                noResults={
                  <MenuItem
                    disabled={true}
                    text='No results.'
                    roleStructure='listoption'
                  />
                }
                popoverContentProps={{
                  style: {
                    maxHeight: 150,
                    overflowX: 'hidden',
                    overflowY: 'auto',
                  },
                }}
              >
                <Button
                  className='cardInset--button'
                  intent='primary'
                  large
                  text={
                    selected
                      ? `${selected.first_name} ${selected.last_name}`
                      : 'New Driver'
                  }
                />
              </Select2>
              <Button
                className='cardInset--button'
                intent='primary'
                large
                onClick={handleAnyDriver}
              >
                Any Driver
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className='cardInset'>
        <div className='cardInset--icon'>
          <Icon icon='arrow-up' iconSize={20} />
        </div>
        <div className='cardInset--data'>
          <p className='statusDescription'>PICKUP</p>
          {match.origin_address.name && <h2>{match.origin_address.name}</h2>}
          <h2>{formatAddress(match.origin_address.formatted_address)}</h2>
          <DateTimeCard dateTime={match.pickup_at} timezone={match.timezone} />
        </div>
      </div>

      <div className='cardInset'>
        <div className='cardInset--icon'>
          <Icon icon='arrow-down' iconSize={20} />
        </div>
        <div className='cardInset--data'>
          <MatchStopDetails match={match} />
        </div>
      </div>

      {user && shipper && (
        <div className='cardInset'>
          <div className='cardInset--icon'>
            <Icon icon='box' iconSize={20} />
          </div>
          <div className='cardInset--data'>
            <p className='statusDescription'>SHIPPER</p>
            <h2>
              {shipper.first_name} {shipper.last_name}
            </h2>
            <p className='statusNote'>{shipper.email}</p>
          </div>
        </div>
      )}

      <div className='cardDivider' />

      {driver && (
        <div className='cardInset'>
          <div className='cardInset--icon'>
            <Icon icon='drive-time' iconSize={22} />
          </div>
          <div className='cardInset--data'>
            <p className='statusDescription'>
              YOUR DRIVER
              <span className='statusRight'>
                <a
                  href={`tel:${formatPhoneNumberSimplify(driver.phone_number)}`}
                >
                  <Icon icon='phone' iconSize={10} /> Call
                </a>{' '}
                &nbsp;{' '}
                <a
                  href={`sms:${formatPhoneNumberSimplify(driver.phone_number)}`}
                >
                  <Icon icon='mobile-phone' iconSize={10} /> Text
                </a>
              </span>
            </p>
            <h2 data-testid='driver_name'>
              {driver.first_name} {driver.last_name}
            </h2>
            <p className='statusNote'>
              {driver.vehicle.vehicle_year} {driver.vehicle.vehicle_make}{' '}
              {driver.vehicle.vehicle_model}
            </p>
            <p className='statusNote'>
              <a href={`tel:${formatPhoneNumberSimplify(driver.phone_number)}`}>
                {driver.phone_number}
              </a>
            </p>
          </div>
        </div>
      )}

      <div className='cardInset'>
        <div className='cardInset--icon'>
          <Icon icon='calendar' iconSize={22} />
        </div>
        <div className='cardInset--data'>
          <p className='statusDescription'>
            MATCH #{match.shortcode || match.id}
          </p>
          <h2>{formatDateVerbose(match.inserted_at, match.timezone)}</h2>
        </div>
      </div>

      <div className='cardThreeColumn'>
        <div className='cardInset'>
          <div className='cardInset--data'>
            <p className='statusDescription'>VEHICLE</p>
            <h2>{formatVehicle(match.vehicle_class)}</h2>
          </div>
        </div>

        <div className='cardInset'>
          <div className='cardInset--data'>
            <p className='statusDescription'>
              PRICE
              <span className='statusRight'>
                <span style={{ color: '#00F' }}>
                  <Icon icon='properties' iconSize={10} />
                </span>
                &nbsp;{' '}
              </span>
            </p>
            <h2>
              ${match.total_price ? match.total_price.toFixed(2) : '0.00'}
            </h2>
          </div>
        </div>

        <div className='cardInset'>
          <div className='cardInset--data'>
            <p className='statusDescription'>DISTANCE</p>
            <h2>{formatDistance(match.total_distance)}</h2>
          </div>
        </div>
      </div>

      <MatchTimestamps match={match} />
    </Card>
  ) : null;
}
