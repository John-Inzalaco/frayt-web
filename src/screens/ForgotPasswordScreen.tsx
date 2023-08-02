import { useState } from 'react';
import { Button } from '@blueprintjs/core';
import { Grid, Row, Col } from 'react-flexbox-grid';
import { useNavigate } from 'react-router-dom';
import ErrorCallout from '../components/ErrorCallout';
import ForgotPasswordForm from '../components/user/ForgotPasswordForm';

export default function ForgotPasswordScreen() {
  const [linkSent, setLinkSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  return (
    <div className='appContent login'>
      <Grid className='login-fullheight'>
        <Row className='login-centered'>
          <Col xs={0} md={3} lg={4} className='unusedMobileColumn'></Col>
          <Col xs={12} md={6} lg={4} className='leftColumn'>
            <div>
              <div className='actionForm' style={{ paddingTop: 50 }}>
                <img
                  src={'/img/logo-badge.png'}
                  className='centerImage'
                  style={{ width: '25%', marginBottom: 30 }}
                  alt='Frayt'
                />
                {linkSent ? (
                  <div>
                    <h1 className='loginHeader'>Check your email!</h1>
                    <h2 className='loginDriver'>
                      {'It should arrive shortly with instructions.'}
                    </h2>
                  </div>
                ) : (
                  <div>
                    <h1 className='loginHeader'>Forgot your password?</h1>
                    <h2 className='loginDriver'>
                      {'Enter your email to reset it.'}
                    </h2>
                  </div>
                )}
                <ErrorCallout error={error} />
                {!linkSent && (
                  <ForgotPasswordForm
                    setLinkSent={setLinkSent}
                    setError={setError}
                  />
                )}
                <Button
                  text='Back'
                  large
                  fill
                  className='whiteButton'
                  onClick={() => {
                    navigate('/');
                  }}
                  style={{ marginTop: 10 }}
                />
              </div>
            </div>
          </Col>
        </Row>
      </Grid>
    </div>
  );
}
