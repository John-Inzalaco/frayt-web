import { Card, Elevation } from '@blueprintjs/core';
import { useField } from 'formik';
import { Col, Row } from 'react-flexbox-grid';
import { useSelector } from 'react-redux';
import { VehicleClass } from '../../lib/actions/MatchAction';
import { selectEstimate } from '../../lib/reducers/estimateSlice';
import { formatVehicle, formatVehicleImage } from '../../lib/Utility';
import FieldError from '../form/FieldError';
import TextButton from '../TextButton';
import { UnloadMethodSelect } from '../UnloadMethodSelect';

type VehicleCardProps = {
  lgSize: number;
  vehicleClass: VehicleClass;
};

function VehicleCard({ lgSize, vehicleClass }: VehicleCardProps) {
  const [{ value: selectedVehicleClass }, , { setValue, setTouched }] =
    useField('vehicle_class');

  const handleChange = (vehicleClass: VehicleClass) => {
    setTouched(true, false);
    setValue(vehicleClass);
  };
  return (
    <Col xs={12} lg={lgSize}>
      <Card
        interactive
        elevation={
          vehicleClass === selectedVehicleClass
            ? Elevation.THREE
            : Elevation.ONE
        }
        onClick={() => handleChange(vehicleClass)}
        className={
          vehicleClass === selectedVehicleClass ? 'card cardSelected' : 'card'
        }
      >
        <div className='cardImage'>
          <img
            src={formatVehicleImage(vehicleClass, selectedVehicleClass)}
            alt='Frayt'
          />
        </div>
        <div className='cardText'>
          <h3>
            <TextButton>{formatVehicle(vehicleClass)}</TextButton>
          </h3>
        </div>
      </Card>
    </Col>
  );
}

export function VehicleClassSelect() {
  const match = useSelector(selectEstimate);
  const hasBoxTrucks = match ? !!match.market?.has_box_trucks : false;
  const columns = hasBoxTrucks ? 3 : 4;
  const [{ value }] = useField('vehicle_class');

  return (
    <>
      <Row>
        <VehicleCard vehicleClass={VehicleClass.Car} lgSize={columns} />
        <VehicleCard vehicleClass={VehicleClass.Midsize} lgSize={columns} />
        <VehicleCard vehicleClass={VehicleClass.CargoVan} lgSize={columns} />
        {hasBoxTrucks && (
          <VehicleCard vehicleClass={VehicleClass.BoxTruck} lgSize={columns} />
        )}
        <Col xs={12}>
          <FieldError name='vehicle_class' />
        </Col>
      </Row>

      {value === VehicleClass.BoxTruck && <UnloadMethodSelect />}
    </>
  );
}
