import { Icon, Spinner } from '@blueprintjs/core';
import { Grid, Row, Col } from 'react-flexbox-grid';
import { Match } from '../../lib/actions/MatchAction';
import { useState } from 'react';
import MatchFeedbackForm from './MatchFeedbackForm';
import { useAppDispatch } from '../../lib/store';
import { updateMatch } from '../../lib/reducers/matchesSlice';
import TextButton from '../TextButton';

type RatingIconProps = {
  rating: number;
};

function RatingIcon({ rating }: RatingIconProps) {
  const name = rating === 5 ? 'thumbs-up' : 'thumbs-down';
  return <Icon icon={name} iconSize={22} />;
}

type RatingButtonProps = {
  selectRating: (rating: number) => void;
  rating: number;
};

function RatingButton({ rating, selectRating }: RatingButtonProps) {
  return (
    <TextButton onClick={() => selectRating(rating)}>
      <RatingIcon rating={rating} />
    </TextButton>
  );
}

type RateMatchProps = {
  match: Match;
  defaultRating: number | null;
};

export default function RateMatch({ match, defaultRating }: RateMatchProps) {
  const dispatch = useAppDispatch();
  const [rating, setRating] = useState<number | null>(defaultRating);
  const [loading, setLoading] = useState(false);

  const selectRating = async (rating: number | null) => {
    setRating(rating);

    if (rating === 5) {
      setLoading(true);
      await dispatch(updateMatch([match.id, { rating }]));
      setLoading(false);
    }
  };

  if (match.rating) {
    return (
      <div className='reviewBox'>
        <Grid className='ratingBox'>
          <Row className='ratingBox__interior'>
            <Col>
              <h2 className='u-push__top--xs'>Thank you for rating!</h2>
            </Col>
          </Row>
          <Row className='ratingBox__interior'>
            <Col className='u-push__bottom--xs'>
              Your feedback is greatly appreciated.
            </Col>
          </Row>
        </Grid>
      </div>
    );
  } else {
    if (rating && rating < 5) {
      return (
        <div className='reviewBox' id='rating'>
          <Grid>
            <Row className='u-push__top--xs'>
              <h2>Rate Match </h2>
            </Row>
            <div className='infoBox u-push__top--xs'>
              <MatchFeedbackForm match={match} rating={rating} />
            </div>
          </Grid>
        </div>
      );
    } else {
      return (
        <div className='reviewBox'>
          <Grid className='ratingBox'>
            <Row className='ratingBox__interior'>
              <h2 className='u-push__top--xs'>Rate Match </h2>
            </Row>
            <Row className='ratingBox__interior'>
              <p>
                How was your delivery experience?
                <br />
              </p>
            </Row>
            <Row className='ratingBox__interior'>
              {loading ? (
                <Spinner />
              ) : (
                <p>
                  <RatingButton rating={5} selectRating={selectRating} />
                  <RatingButton rating={1} selectRating={selectRating} />
                </p>
              )}
            </Row>
          </Grid>
        </div>
      );
    }
  }
}
