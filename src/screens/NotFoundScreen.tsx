import { Button } from '@blueprintjs/core';
import { Col, Grid, Row } from 'react-flexbox-grid';
import { Link } from 'react-router-dom';

export default function NotFoundScreen() {
  return (
    <div className='appContent'>
      <Grid>
        <Row className='appCushion'></Row>
        <Row className='UtilityScreen'>
          <Col xs={12}>
            <h2>Not Found</h2>
            <p>
              It seems like the page you are looking for is not at this
              location.
            </p>
            <Link to={'/ship'}>
              <Button className='secondaryButtonFilled'>Ship with Frayt</Button>
            </Link>
          </Col>
        </Row>
      </Grid>
    </div>
  );
}
