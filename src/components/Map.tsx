import { useGoogleMaps } from './GoogleMapsProvider';
import { Spinner } from '@blueprintjs/core';
import { GoogleMap, DirectionsRenderer } from '@react-google-maps/api';

export type Directions = google.maps.DirectionsResult | null;

type MapProps = {
  markers: React.ReactNode[];
  directions: Directions;
} & Pick<React.ComponentProps<typeof GoogleMap>, 'onLoad'>;

export default function Map({ directions, markers, ...props }: MapProps) {
  const mapHeight = window.innerWidth > 767 ? '690px' : '345px';
  const { isLoaded } = useGoogleMaps();

  return isLoaded ? (
    <GoogleMap
      zoom={8}
      mapContainerStyle={{ height: mapHeight }}
      options={{
        streetViewControl: false,
        mapTypeControl: false,
      }}
      {...props}
    >
      {markers}
      {directions && (
        <DirectionsRenderer
          directions={directions}
          options={{ preserveViewport: true }}
        />
      )}
    </GoogleMap>
  ) : (
    <div>
      <Spinner />
    </div>
  );
}
