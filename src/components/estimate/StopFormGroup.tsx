import { Button, FormGroup, Icon, InputGroup, Label } from '@blueprintjs/core';
import { Field, useFormikContext } from 'formik';
import { Draggable } from 'react-beautiful-dnd';
import { Col, Row } from 'react-flexbox-grid';
import { VehicleClass } from '../../lib/actions/MatchAction';
import { alphaIndex } from '../../lib/Utility';
import FieldError from '../form/FieldError';
import { PlacesSearch } from '../form/PlacesSearch';
import ItemsRepeater from './ItemsRepeater';
import LoadUnloadToggle from './LoadUnloadToggle';
import PalletJackToggle from './PalletJackToggle';
import { EstimateStopValues, EstimateValues } from './steps/Estimate';

type StopFormGroupProps = {
  index: number;
  removeStop: () => void;
  swapStop: (indexA: number, indexB: number) => void;
  showSideBar: boolean;
  stop: EstimateStopValues;
};

export default function StopFormGroup({
  stop,
  index,
  removeStop,
  swapStop,
  showSideBar,
}: StopFormGroupProps) {
  const name = `stops[${index}]`;
  const width = showSideBar ? 12 : 6;

  const {
    values: { vehicle_class, stops },
  } = useFormikContext<EstimateValues>();

  return (
    <Draggable key={stop.drag_id} draggableId={stop.drag_id} index={index}>
      {provided => (
        <div
          className='draggable-dropoff'
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          <Row>
            <Col md={width}>
              <div className='move-buttons'>
                <Button
                  className='move-button desktop-hidden'
                  onClick={() => index > 0 && swapStop(index - 1, index)}
                >
                  <Icon icon='arrow-up' />
                </Button>
                <Button
                  className='move-button desktop-hidden'
                  onClick={() =>
                    index < stops.length - 2 && swapStop(index + 1, index)
                  }
                >
                  <Icon icon='arrow-down' />
                </Button>
              </div>
              <Label data-test-id='destination'>
                {' '}
                <div className='match-stop-alpha-id'>{alphaIndex(index)}</div>
                ADDRESS
                <PlacesSearch
                  name={`${name}.destination_address`}
                  placeName={`${name}.destination_place_id`}
                  icon='arrow-down'
                />
                <FieldError name={`${name}.destination_address`} />
              </Label>
              <FormGroup
                label='P.O. / JOB #'
                labelInfo='(Optional)'
                labelFor={`${name}.po`}
              >
                <Field as={InputGroup} name={`${name}.po`} />
                <FieldError name={`${name}.po`} />
              </FormGroup>
              <LoadUnloadToggle name={name} />
              {vehicle_class === VehicleClass.BoxTruck && (
                <PalletJackToggle name={name} />
              )}
            </Col>
            <Col
              md={width}
              style={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <button
                {...provided.dragHandleProps}
                className='drag-button compact-button mobile-hidden'
              >
                <Icon icon='menu' iconSize={26} />
              </button>
              <ItemsRepeater stopIndex={index} />
            </Col>
          </Row>

          <Button className='remove-stop warningButton' onClick={removeStop}>
            Remove Stop
          </Button>
        </div>
      )}
    </Draggable>
  );
}
