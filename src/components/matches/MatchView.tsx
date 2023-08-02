import { Col, Row } from 'react-flexbox-grid';
import { useSearchParams } from 'react-router-dom';
import MatchMap from './MatchMap';
import { Match, MatchState } from '../../lib/actions/MatchAction';
import CancelMatch from './CancelMatch';
import MatchPanel from './MatchPanel';
import RateMatch from './RateMatch';
import { useSelector } from 'react-redux';
import { selectUser } from '../../lib/reducers/userSlice';
import { matchInState } from '../../lib/Utility';

type MatchPanelProps = {
  match: Match;
};

export default function MatchView({ match }: MatchPanelProps) {
  const [searchParams] = useSearchParams();
  const rating = searchParams.get('rating');
  const user = useSelector(selectUser);

  const isMatchEnRoute = () => {
    if (!match.stops) return false;

    return matchInState(match, [
      MatchState.PickedUp,
      MatchState.ArrivedAtPickup,
      MatchState.EnRouteToPickup,
    ]);
  };

  const showRatingModal = () => {
    return matchInState(match, [MatchState.Completed, MatchState.Charged]);
  };

  const showCancelOption = () => {
    switch (match.state) {
      case 'pending':
      case 'scheduled':
      case 'assigning_driver':
      case 'unable_to_pickup':
        return true;
      case 'accepted':
        return true;

      default:
        return false;
    }
  };

  const defaultRating = parseInt(rating || '') || null;

  return (
    <Row className='statusPane'>
      <Col xs={12} lg={4}>
        <MatchPanel match={match} />
      </Col>

      <Col xs={12} lg={8}>
        <MatchMap match={match} isEnRoute={isMatchEnRoute()} />
        {user && user.id === match?.shipper?.id ? (
          <>
            {showRatingModal() && (
              <RateMatch defaultRating={defaultRating} match={match} />
            )}
            {showCancelOption() && <CancelMatch match={match} />}
          </>
        ) : (
          <div className='reviewBox'>
            {user ? (
              <p>
                This Match was created by another Shipper. Contact creator to
                cancel or rate this Match
              </p>
            ) : (
              <h2>You are not logged in</h2>
            )}
          </div>
        )}
      </Col>
    </Row>
  );
}
