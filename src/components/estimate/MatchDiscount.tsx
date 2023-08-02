import { Match } from '../../lib/actions/MatchAction';
import { displayPrice } from '../../lib/Utility';

type MatchDiscountProps = {
  match: Match | null;
};

export default function MatchDiscount({ match }: MatchDiscountProps) {
  return match?.coupon ? (
    <p>
      <strong>
        {match.coupon.percentage}% OFF (
        {displayPrice(match.price_discount, false)})
      </strong>
    </p>
  ) : null;
}
