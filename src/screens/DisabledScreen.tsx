import { Grid, Row, Col } from 'react-flexbox-grid';
import { useSelector } from 'react-redux';
import { selectUser } from '../lib/reducers/userSlice';

export default function DisabledScreen() {
  const user = useSelector(selectUser);
  return (
    <div className='appContent'>
      <Grid>
        <Row className='appCushion'>
          {/* We can display callouts here in the future if needed */}
        </Row>
        <Row>
          <Col xs={12} md={12}>
            <h1 className='pageTitle'>Ship</h1>
          </Col>
        </Row>

        <Row>
          <Col xs={12} className='shipTab'>
            The account belonging to {user?.first_name} {user?.last_name} with
            the email address {user?.email} has been disabled. If you need
            further information or would like to know more information, you can
            reach out to us by emailing{' '}
            <a href='mailto:support@frayt.com'>support@frayt.com</a>.
          </Col>
        </Row>
      </Grid>
    </div>
  );
}
