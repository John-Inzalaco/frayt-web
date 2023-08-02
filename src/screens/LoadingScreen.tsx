import { Spinner } from '@blueprintjs/core';
import { Col, Grid, Row } from 'react-flexbox-grid';

export default function LoadingScreen() {
  return (
    <div className='appContent'>
      <Grid>
        <Row className='appCushion'></Row>
        <Row className='UtilityScreen'>
          <Col xs={12}>
            <h2>
              Loading <Spinner />
            </h2>
            <p>We are loading your profile information.</p>
          </Col>
        </Row>
      </Grid>
    </div>
  );
}
