import { useNavigate } from 'react-router-dom';
import { faBolt } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useSelector } from 'react-redux';
import { selectUser } from '../lib/reducers/userSlice';
import { ShipperState } from '../lib/actions/ShipperAction';
import { useEffect } from 'react';
import { Grid, Row, Col } from 'react-flexbox-grid';

export default function WelcomeScreen() {
  const user = useSelector(selectUser);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
    } else if (user?.state === ShipperState.Approved) {
      navigate('/ship');
    }
  });

  return (
    <div className='welcome appContent' key='welcome'>
      <Grid>
        <Row center='xs'>
          <Col>
            <Row className='appCushion'></Row>
            <Row className='welcomeMsg' center='xs'>
              <div className='welcomeIcon'>
                <span>
                  {' '}
                  <FontAwesomeIcon icon={faBolt} size='5x' />{' '}
                </span>
              </div>
            </Row>
            <Row center='xs'>
              <h2>Thank you for registering!</h2>
            </Row>
            <Row style={{ color: 'gray' }}>
              <p>
                You can take a look around while you wait for your account to be{' '}
              </p>
            </Row>
            <Row style={{ color: 'gray' }}>
              <p>
                approved. You can expect approval within{' '}
                <strong> 2 business days.</strong> If you have
              </p>
            </Row>

            <Row style={{ color: 'gray' }}>
              <p>
                an urgent need, please contact the sales staff to expedite the
                process.
              </p>
            </Row>

            <Row style={{ color: 'gray' }} center='xs'>
              <button
                className={
                  'bp4-button bp4-large primaryButtonFilled u-push__top--md'
                }
                onClick={() => navigate('/ship')}
              >
                Continue
              </button>
            </Row>
          </Col>
        </Row>
      </Grid>
    </div>
  );
}
