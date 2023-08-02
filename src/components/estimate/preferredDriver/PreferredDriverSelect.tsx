import { Card, Elevation, FormGroup, Radio, Text } from '@blueprintjs/core';
import { useEffect, useState } from 'react';
import { Col, Row } from 'react-flexbox-grid';
import { useAppDispatch } from '../../../lib/store';
import { fetchInteractedDrivers } from '../../../lib/reducers/userSlice';
import { Driver } from '../../../lib/actions/MatchAction';
import PreferredDriverSelectByRecentDrivers from './PreferredDriverSelectByRecentDrivers';
import { DriverDataCard } from './DriverDataCard';
import PreferredDriverSelectByEmail from './PreferredDriverSelectByEmail';
import { useField } from 'formik';

type PreferredDriverSelectOptionProps = {
  label: string;
  caption: string;
  selected: boolean;
  onSelected: () => void;
};

function PreferredDriverSelectOption({
  label,
  caption,
  selected,
  onSelected,
}: PreferredDriverSelectOptionProps) {
  return (
    <Col xs={4}>
      <Card
        interactive
        elevation={selected ? Elevation.THREE : Elevation.ONE}
        onClick={() => onSelected()}
        className={
          selected ? 'card left-aligned cardSelected' : 'card left-aligned'
        }
      >
        <Row>
          <Col sm={12}>
            <Radio label={label} checked={selected} className='cardTitle' />
          </Col>
          <Col sm={12}>
            <Text>{caption}</Text>
          </Col>
        </Row>
      </Card>
    </Col>
  );
}

export function PreferredDriverSelect() {
  const [selectedOption, setSelectedOption] = useState([true, false, false]);
  const dispatch = useAppDispatch();
  const [recentDrivers, setDriverList] = useState<Driver[]>();
  const [showDriverData, setShowDriverData] = useState<boolean>(false);
  const [selectedPreferredDriver, setSelectedPreferredDriver] =
    useState<Driver>();

  const [{ value: _preferred_driver_id }, , { setValue, setTouched }] =
    useField('preferred_driver_id');

  const handleChange = (preferred_driver_id: string | undefined) => {
    setTouched(true, false);
    setValue(preferred_driver_id);
  };

  useEffect(() => {
    dispatch(fetchInteractedDrivers())
      .unwrap()
      .then(({ data }) => {
        setDriverList(data);
      })
      .catch((e: unknown) => {
        console.log(e);
      });
  }, [dispatch]);

  return (
    <>
      <div className='panelDivider' />
      <FormGroup
        style={{ display: 'grid' }}
        label='Preferred Driver'
        inline={true}
        labelFor='driver'
        labelInfo='(Optional)'
        className='u-push__top--lg'
      >
        <Row>
          <PreferredDriverSelectOption
            label='None'
            caption='Automatically assign a driver'
            selected={selectedOption[0]}
            onSelected={() => {
              if (selectedOption[0]) return;
              setSelectedPreferredDriver(undefined);
              // preferred driver id must be empty string to unassign
              handleChange('');
              setSelectedOption([true, false, false]);
            }}
          />
          <PreferredDriverSelectOption
            label='Recent Drivers'
            caption="Choose from a driver you've used before"
            selected={selectedOption[1]}
            onSelected={() => {
              if (selectedOption[1]) return;
              setSelectedPreferredDriver(undefined);
              handleChange('');
              setSelectedOption([false, true, false]);
            }}
          />
          <PreferredDriverSelectOption
            label='Email'
            caption='Choose any driver by their email address'
            selected={selectedOption[2]}
            onSelected={() => {
              if (selectedOption[2]) return;
              setSelectedPreferredDriver(undefined);
              handleChange('');
              setSelectedOption([false, false, true]);
            }}
          />
        </Row>
        <Row>
          {selectedOption[1] && (
            <PreferredDriverSelectByRecentDrivers
              recentDrivers={recentDrivers ?? []}
              onSelect={selectedDriver => {
                setSelectedPreferredDriver(selectedDriver);
                handleChange(selectedDriver?.id);
                setShowDriverData(true);
              }}
            />
          )}
          {selectedOption[2] && (
            <PreferredDriverSelectByEmail
              currentPreferredDriver={selectedPreferredDriver}
              onSelect={selectedDriver => {
                setSelectedPreferredDriver(selectedDriver);
                handleChange(selectedDriver?.id);
                setShowDriverData(false);
              }}
            />
          )}
        </Row>
        {selectedPreferredDriver && showDriverData && (
          <Row>
            <Col xs={6} className='u-push__top--lg'>
              <DriverDataCard driver={selectedPreferredDriver} />
            </Col>
          </Row>
        )}
      </FormGroup>
    </>
  );
}
