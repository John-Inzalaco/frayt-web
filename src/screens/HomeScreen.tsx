import { Grid, Row, Col } from 'react-flexbox-grid';
import Login from '../components/user/auth/Login';

export default function HomeScreen() {
  return (
    <div className='appContent login'>
      <Grid className='login-fullheight'>
        <Row className='login-centered'>
          <Col xs={0} md={3} lg={4} className='unusedMobileColumn'></Col>
          <Col xs={12} md={6} lg={4} className='leftColumn'>
            {/* <div>
							<h1 className="loginHeader" style={{color: 'white'}}>We'll Back Back Shortly</h1>
							<p className="loginSubtitle" style={{color: 'white', fontWeight: 'normal'}}>The Frayt app is down for maintenance and an upgrade from 7pm EST 8/21 until 8/22 in the afternoon. Any orders placed already will be taken care of.</p>
                        </div> */}
            <Login />
          </Col>
        </Row>
      </Grid>
    </div>
  );
}
