import { addBreadcrumb, captureMessage, Severity } from '@sentry/react';
import { Socket } from 'phoenix';
import { useRef } from 'react';
import { DriverLocation } from './actions/MatchAction';

export function useSocket(): Socket {
  const initialSocket = new Socket(
    process.env.REACT_APP_FRAYT_SOCKET_URL || ''
  );
  const ref = useRef(initialSocket);

  return ref.current;
}

export function subscribeToDriverLocation(
  socket: Socket,
  driver_id: string,
  onChange: (dl: DriverLocation) => void
) {
  const channel = socket.channel(`driver_locations:${driver_id}`);

  channel
    .join()
    .receive('ok', (driverLocation: DriverLocation) => {
      console.log('joined channel');
      onChange(driverLocation);
    })
    .receive('error', reason => {
      captureMessage(
        'driver location channel error: ' + JSON.stringify(reason),
        Severity.Error
      );
    });

  channel.on('driver_location', (driverLocation: DriverLocation) =>
    onChange(driverLocation)
  );

  channel.onError(e => {
    console.log('driver location channel connection error', e);
    addBreadcrumb({
      message: 'driver location channel connection error',
      level: Severity.Info,
    });
  });

  channel.onClose(() => {
    console.log('driver location channel closed');
    addBreadcrumb({
      message: 'driver location channel closed',
      level: Severity.Info,
    });
  });

  return channel;
}
