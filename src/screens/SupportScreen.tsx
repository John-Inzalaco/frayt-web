import { Button, Card, Elevation } from '@blueprintjs/core';
import { Grid, Row, Col } from 'react-flexbox-grid';
import Intercom from '../lib/Intercom';

export default function SupportScreen() {
  return (
    <div className='appContent'>
      <Grid>
        <Row className='appCushion'>
          {/* We can display callouts here in the future if needed */}
        </Row>
        <Row style={{ marginBottom: 20 }}>
          <Col xs={12} md={12}>
            <h1 className='pageTitle'>Support</h1>
            <h2 style={{ marginTop: 0 }}>How can we help you?</h2>
          </Col>
        </Row>

        <Row>
          <Col xs={12} lg={6} style={{ marginBottom: 20 }}>
            <Card
              interactive={false}
              elevation={Elevation.ONE}
              className='infoCard'
              style={{ marginBottom: 20 }}
            >
              <h2>Chat + Knowledge Base</h2>
              You can instantly search our{' '}
              <a
                href='http://intercom.frayt.com/en/collections/2919697-customers'
                target='_blank'
                rel='noreferrer'
              >
                knowledge base
              </a>{' '}
              or get in touch with a live agent. Click the floating chat icon in
              the bottom right or use the button below.
              <br />
              <br />
              <Button
                icon={'lifesaver'}
                large={true}
                onClick={() => Intercom('show')}
              >
                Open Chatbot
              </Button>
            </Card>
          </Col>
        </Row>
      </Grid>
    </div>
  );
}
