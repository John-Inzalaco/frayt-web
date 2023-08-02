import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBoxes, faTruck } from '@fortawesome/pro-regular-svg-icons';
import LoginForm from './LoginForm';
import { Row, Col } from 'react-flexbox-grid';
import { Card } from '@blueprintjs/core';
import { useSelector } from 'react-redux';
import { selectAuthStatus } from '../../../lib/reducers/userSlice';
import TextButton from '../../TextButton';

export type UserType = 'shipper' | 'driver' | null;

type LoginProps = {
  shipScreen: boolean;
};

export default function Login(props: LoginProps) {
  const [selectedUserType, selectUserType] = useState<UserType>(null);
  const authStatus = useSelector(selectAuthStatus);

  return (
    <div>
      <div className='actionForm' style={{ paddingTop: 15 }}>
        {authStatus === 'succeeded' || (
          <div>
            <h1 className='loginHeader'>Sign Up To Ship</h1>
            <p className='loginSubtitle'>We&apos;ll pickup in under an hour</p>
            <p className='loginOptionSelect'>Are you a shipper or a driver?</p>
            <Row>
              <Col xs={12} lg={6}>
                <Card
                  interactive={true}
                  style={{ marginBottom: '15px' }}
                  onClick={() => selectUserType('shipper')}
                  className={
                    selectedUserType === 'shipper'
                      ? 'card cardSelected'
                      : 'card'
                  }
                >
                  <div className='cardImage'>
                    <FontAwesomeIcon icon={faBoxes} size='3x' />
                  </div>
                  <div className='cardText'>
                    <h3>
                      <TextButton>Shipper</TextButton>
                    </h3>
                  </div>
                </Card>
              </Col>
              <Col xs={12} lg={6}>
                <Card
                  interactive={true}
                  onClick={() => selectUserType('driver')}
                  style={{ marginBottom: '15px' }}
                  className={
                    selectedUserType === 'driver' ? 'card cardSelected' : 'card'
                  }
                >
                  <div className='cardImage'>
                    <FontAwesomeIcon icon={faTruck} size='3x' />
                  </div>
                  <div className='cardText'>
                    <h3>
                      <TextButton>Driver</TextButton>
                    </h3>
                  </div>
                </Card>
              </Col>
            </Row>
            {selectedUserType === 'driver' ? (
              <h2 className='loginDriver'>
                <FontAwesomeIcon icon='truck' /> Ready to start driving for
                FRAYT? <br />
                <a href='https://www.frayt.com/apply' className='applyAction'>
                  Click here
                </a>{' '}
                to{' '}
                <a href='https://www.frayt.com/apply' className='applyAction'>
                  apply today
                </a>
                .
              </h2>
            ) : null}
          </div>
        )}
        <LoginForm {...props} userType={selectedUserType} />
      </div>
    </div>
  );
}

Login.defaultProps = {
  shipScreen: false,
};
