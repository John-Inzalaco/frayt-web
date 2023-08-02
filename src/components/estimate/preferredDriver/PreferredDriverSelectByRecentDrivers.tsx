import { useState, useEffect } from 'react';
import { Driver } from '../../../lib/actions/MatchAction';
import { Suggest2 } from '@blueprintjs/select';
import { MenuItem } from '@blueprintjs/core';
import { Col } from 'react-flexbox-grid';

export type RecentDriverOption = {
  name: string;
  phone: string;
  id: string;
};

type PreferredDriverSelectByRecentDriversProps = {
  recentDrivers: Driver[];
  onSelect?: (driver: Driver | undefined) => void;
};

export default function PreferredDriverSelectByRecentDrivers({
  recentDrivers,
  onSelect,
}: PreferredDriverSelectByRecentDriversProps) {
  const [recentDriverOptions, setRecentDriverOptions] = useState<
    RecentDriverOption[]
  >([]);

  const handleChange = (driverID: string) => {
    const driver = recentDrivers.find(driver => driver.id === driverID);
    if (onSelect) onSelect(driver);
  };

  useEffect(() => {
    const drivers = recentDrivers.map(driver => ({
      name: `${driver.first_name} ${driver.last_name}`,
      phone: driver.phone_number,
      id: driver.id,
    }));

    setRecentDriverOptions(drivers);
  }, [recentDrivers]);

  return (
    <Col xs={6} className='u-push__top--lg'>
      <Suggest2
        inputProps={{
          placeholder: 'Search Drivers',
        }}
        closeOnSelect
        items={recentDriverOptions}
        menuProps={{ className: 'selectByRecentDriversSearch' }}
        itemRenderer={item => {
          return (
            <MenuItem
              key={item.id}
              text={item.name}
              label={item.phone}
              onClick={() => handleChange(item.id)}
            />
          );
        }}
        popoverProps={{ matchTargetWidth: true, minimal: true }}
      />
    </Col>
  );
}
