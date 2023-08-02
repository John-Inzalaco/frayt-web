import { useCallback, useEffect, useState } from 'react';
import { Button } from '@blueprintjs/core';
import { Grid, Row, Col } from 'react-flexbox-grid';
import { Link, useParams } from 'react-router-dom';
import { BarLoader } from 'react-spinners';
import {
  DriverLocation,
  getMatch,
  Match,
  MatchState,
} from '../lib/actions/MatchAction';
import NotFoundScreen from './NotFoundScreen';
import { subscribeToDriverLocation, useSocket } from '../lib/FraytSocket';
import MatchView from '../components/matches/MatchView';
import { useSelector } from 'react-redux';
import {
  fetchMatch,
  selectMatchById,
  setCurrentLocation,
  updateMatchState,
} from '../lib/reducers/matchesSlice';
import { RootState } from '../lib/reducers';
import { useAppDispatch } from '../lib/store';
import { matchInState } from '../lib/Utility';

export default function MatchScreen() {
  const socket = useSocket();
  const dispatch = useAppDispatch();
  const { matchID } = useParams();
  const match = useSelector<RootState, Match | undefined>(
    state => selectMatchById(state, matchID),
    (prev, curr) => !!prev?.id && !!curr?.id && prev.id !== curr.id
  );

  const [loading, setLoading] = useState(true);
  const [subbedDriverLocation, setSubbedDriverLocation] = useState(false);

  const setDriverLocation = useCallback(
    (dl: DriverLocation) => {
      dispatch(setCurrentLocation([matchID, dl]));
    },
    [dispatch, matchID]
  );

  const loadMatch = useCallback(async () => {
    if (matchID) {
      setLoading(true);
      await dispatch(fetchMatch(matchID));
      setLoading(false);
    }
  }, [matchID, dispatch]);

  useEffect(() => {
    if (match) {
      if (
        matchInState(match, [
          MatchState.Charged,
          MatchState.Completed,
          MatchState.Canceled,
          MatchState.AdminCanceled,
        ])
      ) {
        if (subbedDriverLocation) {
          setSubbedDriverLocation(false);
          socket.disconnect();
        }
      } else if (match.driver) {
        if (!subbedDriverLocation) {
          setSubbedDriverLocation(true);
          socket.connect();
          subscribeToDriverLocation(socket, match.driver.id, setDriverLocation);
        }
      }
    }
  }, [match, setDriverLocation, socket, subbedDriverLocation]);

  useEffect(() => {
    let updatesCount = 0;

    loadMatch();

    // Update the data every 30 seconds
    const updateInterval = setInterval(async () => {
      updatesCount++;
      if (matchID) {
        const {
          data: { response: newMatch },
        } = await getMatch(matchID);
        dispatch(updateMatchState(newMatch));
      }

      // Once fetched 360 times, stop
      if (updatesCount > 360) {
        clearInterval(updateInterval);
      }
    }, 30000);

    return function cleanup() {
      clearInterval(updateInterval);
    };
  }, [dispatch, loadMatch, matchID]);

  useEffect(() => {
    return function cleanup() {
      setSubbedDriverLocation(false);
      socket.disconnect();
    };
  }, [socket]);
  if (!matchID) return null;
  if (!loading && !match) return <NotFoundScreen />;

  return (
    <div className='appContent'>
      <Grid>
        <Row className='appCushion'>
          {/* We can display callouts here in the future if needed */}
        </Row>
        <Row>
          <Col xs={12} md={6}>
            <h1 className='pageTitle'>Match</h1>
          </Col>
          <Col xs={12} md={6}>
            <Link to={'/ship'}>
              <Button
                large={true}
                rightIcon={'chevron-right'}
                className={'buttonRight'}
              >
                Create Match
              </Button>
            </Link>
          </Col>
        </Row>

        <Row>
          <Col xs={12} style={{ marginBottom: '20px', minHeight: '720px' }}>
            {loading ? (
              <div className='barLoaderContainer'>
                <BarLoader width={100} color='#ff9500' loading />
              </div>
            ) : (
              match && <MatchView match={match} />
            )}
          </Col>
        </Row>
      </Grid>
    </div>
  );
}
