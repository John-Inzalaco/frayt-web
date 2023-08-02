import { Match } from '../../../lib/actions/MatchAction';
import { ChangeTabFunc, ShipTabKey } from '../../../screens/ShipScreen';
import CargoSummary from './CargoSummary';
import DeliverySummary from './DeliverySummary';
import EstimateSummary from './EstimateSummary';
import PaymentSummary from './PaymentSummary';

type SummariesProps = {
  touched?: ShipTabKey[];
  match: Match | null;
  changeTab: ChangeTabFunc;
  initialOpen?: boolean;
};

export default function Summaries({
  match,
  changeTab,
  touched,
  initialOpen = true,
}: SummariesProps) {
  const isTouched = (key: ShipTabKey) => !touched || touched.includes(key);
  const isRoute = !!match && match.stops.length > 1;

  if (match) {
    return (
      <>
        {isTouched(isRoute ? ShipTabKey.Delivery : ShipTabKey.Cargo) && (
          <EstimateSummary
            match={match}
            initialIsOpen={initialOpen}
            onReview={() => changeTab(ShipTabKey.Estimate)}
          />
        )}
        {isTouched(ShipTabKey.Delivery) && (
          <CargoSummary
            match={match}
            initialIsOpen={initialOpen}
            onReview={() => changeTab(ShipTabKey.Cargo)}
          />
        )}
        {isTouched(ShipTabKey.Payment) && (
          <DeliverySummary
            match={match}
            initialIsOpen={initialOpen}
            onReview={() => changeTab(ShipTabKey.Delivery)}
          />
        )}
        {isTouched(ShipTabKey.Review) && (
          <PaymentSummary
            initialIsOpen={initialOpen}
            onReview={() => changeTab(ShipTabKey.Payment)}
          />
        )}
      </>
    );
  }

  return null;
}
