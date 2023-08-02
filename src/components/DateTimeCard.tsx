import { Icon } from '@blueprintjs/core';
import { formatDateScheduling } from '../lib/Utility';

type TimeCardProps = {
  dateTime: string | null;
  timezone: string | null;
};
export default function DateTimeCard({ dateTime, timezone }: TimeCardProps) {
  return (
    <p className='date-time-card'>
      <Icon
        icon='time'
        iconSize={13}
        style={{ top: -1, position: 'relative' }}
      />{' '}
      {formatDateScheduling(dateTime, timezone)}
    </p>
  );
}
