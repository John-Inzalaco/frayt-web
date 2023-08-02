import { Fee } from '../../../lib/actions/MatchAction';
import MatchSectionControl, { MatchSectionProps } from './MatchSectionControl';
import { formatVehicle, centsToDollars } from '../../../lib/Utility';
import moment from 'moment';

type FeeProps = { fee: Fee };

function FeeDetail({ fee: { name, amount } }: FeeProps) {
  return (
    <tr
      style={
        name === 'Preferred Driver Fee'
          ? { textDecoration: 'line-through' }
          : {}
      }
    >
      <td colSpan={2}>{name}</td>
      <td style={{ textAlign: 'right' }}>${centsToDollars(amount)}</td>
    </tr>
  );
}

export default function PricingBreakdownSection({
  match,
  isActive,
  showMore,
  goBack,
}: MatchSectionProps) {
  return (
    <MatchSectionControl
      isActive={isActive}
      goBack={goBack}
      showMore={showMore}
      title='Pricing Breakdown'
    >
      {isActive && (
        <>
          <div className='oneThird'>
            <div className='infoBox infoBox--row'>
              <strong className='heading'>Order Date</strong>
              <p>{moment(match.inserted_at).format('MMM Do, YYYY')}</p>
            </div>
            <div className='infoBox infoBox--row'>
              <strong className='heading'>Match ID</strong>
              <p>{match.shortcode}</p>
            </div>
            <div className='infoBox infoBox--row'>
              <strong className='heading'>Vehicle</strong>
              <p>{formatVehicle(match.vehicle_class)}</p>
            </div>
          </div>
          <table className='bp4-html-table'>
            <thead>
              <tr>
                <th colSpan={2}>Fee</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={3}></td>
              </tr>
              {match.fees.length > 0 ? (
                match.fees.map(fee => <FeeDetail fee={fee} key={fee.id} />)
              ) : (
                <tr>
                  <td>
                    <h2>No results found</h2>
                  </td>
                </tr>
              )}
              {match.price_discount > 0 && (
                <tr>
                  <td colSpan={2}>Discounts</td>
                  <td style={{ textAlign: 'right', color: '#090' }}>
                    -${match.price_discount}
                  </td>
                </tr>
              )}
              <tr>
                <th colSpan={2}>Total</th>
                <th style={{ textAlign: 'right', color: '#238551' }}>
                  ${match.total_price}
                </th>
              </tr>
            </tbody>
          </table>
        </>
      )}
    </MatchSectionControl>
  );
}
