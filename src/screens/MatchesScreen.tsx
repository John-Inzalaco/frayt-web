import { Button } from '@blueprintjs/core';
import { Grid, Row, Col } from 'react-flexbox-grid';
import { Link } from 'react-router-dom';
import MatchesList from '../components/matches/MatchesList';

export default function MatchesScreen() {
  return (
    <div className='appContent'>
      <Grid>
        <Row className='appCushion'>
          {/* We can display callouts here in the future if needed */}
        </Row>
        <Row middle='xs'>
          <Col xs={12} sm>
            <h1 className='pageTitle'>Matches</h1>
          </Col>
          <Col xs={12} sm className='shrink'>
            <Link to={'/ship'}>
              <Button
                large={true}
                rightIcon='chevron-right'
                className='no-wrap'
              >
                Create Match
              </Button>
            </Link>
          </Col>
        </Row>

        <Row>
          <Col xs={12} style={{ marginBottom: '20px' }}>
            <MatchesList />
          </Col>
        </Row>
      </Grid>
    </div>
  );
}
