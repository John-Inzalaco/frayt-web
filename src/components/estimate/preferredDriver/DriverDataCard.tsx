import { Card, Text } from '@blueprintjs/core';
import { faUser } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Col, Row } from 'react-flexbox-grid';
import { Driver } from '../../../lib/actions/MatchAction';
import { useEffect, useState } from 'react';
import moment from 'moment';

type DriverDataCardProps = {
  driver: Driver;
};

export function DriverDataCard({ driver }: DriverDataCardProps) {
  const formatLastActive = (driver: Driver) =>
    driver.current_location
      ? moment(driver.current_location.created_at).fromNow()
      : 'Unknown';

  const [lastActive, setLastActive] = useState(
    formatLastActive(driver as unknown as Driver)
  );

  useEffect(() => {
    setLastActive(formatLastActive(driver as unknown as Driver));
  }, [driver]);

  return (
    <Card className='driverDataCard'>
      <Row>
        <Col xs className='driverDataCard__personal'>
          <FontAwesomeIcon icon={faUser} className='driverDataCard__profile' />
          <Text className='driverDataCard__nameHeading'>
            {driver.first_name} {driver.last_name}
          </Text>{' '}
          <Text className='driverDataCard__subheader'>
            {driver.phone_number}
          </Text>
        </Col>
        <Col xs>
          <Row end='xs'>
            <Text className='label'>DRIVER</Text>
          </Row>
        </Col>
      </Row>
      <Row
        className='u-push__top--lg'
        style={{ border: '1px solid #cdced0' }}
      ></Row>
      <Row className='u-push__top--lg' between='xs'>
        <Col xs={3}>
          <Text className='driverDataCard__cellHeader'>Vehicle</Text>
          <Text className='driverDataCard__subheader'>
            {driver.vehicle.vehicle_model}
          </Text>
        </Col>
        <Col xs={3}>
          <Text className='driverDataCard__cellHeader'>Last Active</Text>
          <Text className='driverDataCard__subheader'>{lastActive}</Text>
        </Col>
      </Row>
    </Card>
  );
}
