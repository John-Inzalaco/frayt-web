import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ReactTooltip from 'react-tooltip';
import { faInfoCircle } from '@fortawesome/pro-regular-svg-icons';
import { displayPrice } from '../../lib/Utility';
import { Fee, Match } from '../../lib/actions/MatchAction';

type DiscountViewProps = {
  match: Match;
};

function DiscountView({
  match: { coupon, price_discount },
}: DiscountViewProps) {
  if (coupon && price_discount) {
    return (
      <div>
        <b>Discount:</b> -{displayPrice(price_discount, false)} (
        {coupon.percentage}% off)
      </div>
    );
  }

  return null;
}

type FeeViewProps = {
  fee: Fee;
};

function FeeView({ fee: { name, amount, description, type } }: FeeViewProps) {
  let info = null;
  switch (type) {
    case 'route_surcharge':
      info =
        "This charge covers Frayt's cost to calculate and generate a multistop route.";
      break;
    case 'toll_fees':
      info =
        'This charge is the total amount of tolls the driver will encounter on your delivery.';
      break;
  }

  if (amount) {
    return (
      <div>
        <b>{name}:</b> {displayPrice(amount)}
        {description && <i> – {description}</i>}{' '}
        {info && (
          <span className='u-display__inline-block'>
            <FontAwesomeIcon icon={faInfoCircle} data-tip={info} />
            <ReactTooltip place='right' type='info' effect='solid' />
          </span>
        )}
      </div>
    );
  }

  return null;
}

type PriceBreakdownProps = {
  match: Match;
};

export function PriceBreakdown({ match }: PriceBreakdownProps) {
  return (
    <div>
      {match.contract && (
        <>
          <b>Contract:</b> {match.contract.name}
        </>
      )}
      <hr />
      {match.fees.map((fee, index) => (
        <FeeView key={index} fee={fee} />
      ))}
      <DiscountView match={match} />
      <hr />
      <b>TOTAL:</b> {displayPrice(match.total_price, false)}
      <hr />
    </div>
  );
}
