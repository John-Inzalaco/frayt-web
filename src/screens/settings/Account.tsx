import { Card, Elevation } from '@blueprintjs/core';
import { Row, Col } from 'react-flexbox-grid';
import { PaymentChoice } from '../../components/user/PaymentChoice';
import ChangePasswordForm from '../../components/user/ChangePasswordForm';
import ProfileForm from '../../components/user/ProfileForm';

export default function Account() {
  return (
    <>
      <Row style={{ marginBottom: 20 }}>
        <Col xs={12} md={12}>
          <h1 className='pageTitle'>Account</h1>
          <h2 style={{ marginTop: 0 }}>Welcome back!</h2>
          <p>
            You can manage and update your account here. If you need any help,
            you can open a support ticket by emailing{' '}
            <a href='mailto:support@frayt.com'>support@frayt.com</a>.
          </p>
        </Col>
      </Row>

      <Row>
        <Col xs={12} md={12} className='accountCol'>
          <Card
            interactive={false}
            elevation={Elevation.ONE}
            className='infoCard'
            style={{ marginBottom: 20 }}
          >
            <h2>Manage</h2>

            <ProfileForm />
          </Card>
        </Col>

        <Col xs={12} md={12}>
          <Card
            interactive={false}
            elevation={Elevation.ONE}
            className='infoCard'
          >
            <h2>Payment</h2>
            <PaymentChoice />
          </Card>

          <Card
            interactive={false}
            elevation={Elevation.ONE}
            className='infoCard'
            style={{ marginTop: 20 }}
          >
            <h2>Change Password</h2>
            <div>
              Password must meet the following requirements:
              <ul>
                <li>Be a minimum of 8 characters long</li>
                <li>Contain at least one number</li>
                <li>Contain at least one special character</li>
              </ul>
            </div>
            <ChangePasswordForm />
          </Card>
        </Col>
      </Row>
    </>
  );
}
