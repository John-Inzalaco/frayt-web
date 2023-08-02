import { InfoWindow, Marker } from '@react-google-maps/api';
import React, { useCallback, useEffect, useState } from 'react';
import { Driver, Match } from '../../lib/actions/MatchAction';
import Map, { Directions } from '../Map';

const routeDirections = (
  match: Match,
  setDirections: React.Dispatch<Directions>
) => {
  const DirectionsService = new google.maps.DirectionsService();
  const { origin_address } = match;
  const stops = [...match.stops];

  const end_address = stops.pop()?.destination_address;

  if (end_address) {
    const waypoints = stops.map(({ destination_address: { lat, lng } }) => ({
      location: new google.maps.LatLng(lat, lng),
      stopover: true,
    }));

    DirectionsService.route(
      {
        origin: new google.maps.LatLng(origin_address.lat, origin_address.lng),
        destination: new google.maps.LatLng(end_address.lat, end_address.lng),
        waypoints: waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          setDirections(result);
        } else {
          console.error(`Error fetching directions: ${result}`);
          console.error(status);
        }
      }
    );
  }
};

type DriverMarkerProps = {
  driver: Driver | null;
};

function DriverMarker({ driver }: DriverMarkerProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (driver?.current_location) {
    const { first_name, last_name, current_location } = driver;

    return (
      <Marker
        position={current_location}
        // label={"D"}
        icon={{
          url: '/img/icons/location.svg',
          size: new google.maps.Size(28, 28),
          anchor: new google.maps.Point(14, 14),
        }}
        onClick={() => setIsOpen(true)}
      >
        {isOpen && (
          <InfoWindow onCloseClick={() => setIsOpen(false)}>
            <span>
              <b>Driver:</b> {first_name} {last_name}
            </span>
          </InfoWindow>
        )}
      </Marker>
    );
  }

  return null;
}

export type MatchMapProps = {
  match: Match;
  isEnRoute: boolean;
};

export default function MatchMap({ match, isEnRoute }: MatchMapProps) {
  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);

  const [map, setMap] = useState<google.maps.Map>();

  const setBounds = useCallback(() => {
    if (map) {
      const loc = match.driver?.current_location;
      const bounds = new google.maps.LatLngBounds(loc?.id ? loc : null);

      if (directions) bounds.union(directions.routes[0].bounds);

      map.fitBounds(bounds);
    }
  }, [map, directions, match.driver?.current_location]);

  useEffect(() => {
    routeDirections(match, setDirections);
  }, [match, setDirections]);

  useEffect(() => {
    setBounds();
  }, [setBounds]);

  return (
    <Map
      onLoad={setMap}
      directions={directions}
      markers={
        isEnRoute ? [<DriverMarker key={0} driver={match?.driver} />] : []
      }
    />
  );
}
