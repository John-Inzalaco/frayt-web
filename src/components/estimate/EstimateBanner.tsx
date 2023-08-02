import { PopoverInteractionKind, Position, Spinner } from '@blueprintjs/core';
import { Classes, Popover2 } from '@blueprintjs/popover2';
import { faInfoCircle } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useSelector } from 'react-redux';
import {
  selectEstimate,
  selectEstimateStatus,
} from '../../lib/reducers/estimateSlice';
import { displayPrice } from '../../lib/Utility';
import { PriceBreakdown } from './PriceBreakdown';

export default function EstimateBanner() {
  const updating = useSelector(selectEstimateStatus) === 'loading';
  const estimate = useSelector(selectEstimate);
  let content;
  if (updating) {
    content = (
      <div className='spinnerLeft'>
        <Spinner size={40} />
      </div>
    );
  } else {
    if (estimate) {
      const enabled = estimate.fees && estimate.fees.length > 0;
      content = (
        <Popover2
          interactionKind={PopoverInteractionKind.HOVER}
          popoverClassName={Classes.POPOVER2_CONTENT_SIZING}
          position={Position.BOTTOM_RIGHT}
          fill
          content={<PriceBreakdown match={estimate} />}
          disabled={!enabled}
        >
          <h2 className='estimate-banner__header'>
            <span className='estimate-banner__title'>ESTIMATE</span>
            {displayPrice(estimate.total_price, false)}
            <span style={{ fontSize: 17 }}>
              {' '}
              / {estimate.total_distance.toFixed(1)} mi{' '}
            </span>
            {enabled && (
              <span className='u-push__left--xs'>
                <FontAwesomeIcon icon={faInfoCircle} />
              </span>
            )}
          </h2>
        </Popover2>
      );
    } else {
      content = null;
    }
  }

  return content && <div className='estimate-banner'>{content}</div>;
}
