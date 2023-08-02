import { AnchorButton, Button, Label, Spinner } from '@blueprintjs/core';
import {
  Classes,
  Popover2,
  Popover2InteractionKind,
} from '@blueprintjs/popover2';
import { useFormikContext } from 'formik';
import { useState } from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { Col, Row } from 'react-flexbox-grid';
import { useSelector } from 'react-redux';
import {
  selectEstimate,
  selectEstimateStatus,
  updateEstimate,
} from '../../lib/reducers/estimateSlice';
import { useAppDispatch } from '../../lib/store';
import { useFieldArray } from '../form/FieldArray';
import FieldError from '../form/FieldError';
import FormErrors from '../form/FormErrors';
import { PlacesSearch } from '../form/PlacesSearch';
import { buildCargoStopItemValues } from './steps/Cargo';
import {
  buildEstimateStopValues,
  EstimateStopValues,
  EstimateValues,
} from './steps/Estimate';
import StopFormGroup from './StopFormGroup';

const stopsSanitizer = (stops: EstimateStopValues[]) =>
  stops.map((s, i) => ({ ...s, index: i }));

function OptimizeButton() {
  const [isLoading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const match = useSelector(selectEstimate);
  const status = useSelector(selectEstimateStatus);
  const { isValid, values } = useFormikContext<EstimateValues>();
  const tooManyStops = values.stops.length > 12;
  const noEstimate = !match;
  const alreadyOptimized = !!match?.optimized_stops;
  const disabled =
    !isValid ||
    isLoading ||
    status === 'loading' ||
    tooManyStops ||
    noEstimate ||
    alreadyOptimized;

  const optimizeStops = async () => {
    if (match) {
      setLoading(true);
      await dispatch(updateEstimate([match.id, { ...values, optimize: true }]));
      setLoading(false);
    }
  };

  return (
    <Popover2
      interactionKind={Popover2InteractionKind.CLICK}
      className='u-float--right u-width__full u-width__auto--lg'
      popoverClassName={Classes.POPOVER2_CONTENT_SIZING}
      disabled={!disabled} // Don't show popover when continuing to next screen is permitted
      content={
        <div>
          <h3 className='u-push__top--none u-push__bottom--md'>
            {tooManyStops && <p>We can only optimize 12 stops or less</p>}
            {alreadyOptimized && <p>This Match is already optimized</p>}
            {!isValid && <p>Some issues need corrected</p>}
          </h3>
          {!isValid && (
            <div>
              <FormErrors />
            </div>
          )}
          <Button className={Classes.POPOVER2_DISMISS}>Understood</Button>
        </div>
      }
    >
      <AnchorButton
        disabled={disabled}
        className={`dropoff-button u-float--right u-push__left--xs`}
        onClick={optimizeStops}
        rightIcon={isLoading && <Spinner size={20} />}
      >
        Optimize
      </AnchorButton>
    </Popover2>
  );
}

function AddDropoffButton() {
  const [{ value: stops }, , { replace, push }] =
    useFieldArray<EstimateStopValues>({
      name: 'stops',
      sanitizer: stopsSanitizer,
    });

  const items = [buildCargoStopItemValues()];

  const addStop = () => {
    if (stops.length === 1) {
      replace(0, { ...stops[0], items });
    }
    const value = {
      ...buildEstimateStopValues(),
      items,
    };
    push(value);
  };

  return (
    <Button
      className={`dropoff-button u-float--right u-pad__left--xs`}
      onClick={addStop}
    >
      + Add Dropoff
    </Button>
  );
}

type EstimateStopsProps = {
  showSideBar: boolean;
};

export default function StopsRepeater({ showSideBar }: EstimateStopsProps) {
  const [, , { replace, swap, remove }] = useFieldArray<EstimateStopValues>({
    name: 'stops',
    sanitizer: stopsSanitizer,
  });
  const {
    values: { stops },
  } = useFormikContext<EstimateValues>();
  const isRoute = stops.length > 1;

  const swapStop = ({ source, destination }: DropResult) => {
    if (destination !== undefined) {
      swap(source.index, destination.index);
    }
  };

  const removeStop = (index: number) => {
    if (stops.length === 2) {
      replace(0, {
        ...stops[0],
        items: [],
        needs_pallet_jack: false,
        has_load_fee: false,
      });
    }

    remove(index);
  };

  return (
    <div className='u-push__bottom--lg'>
      {!isRoute && (
        <Row>
          <Col xs={12}>
            <AddDropoffButton />
          </Col>
        </Row>
      )}
      <Row>
        <Col xs={12} md={showSideBar ? 12 : 6}>
          <Label>
            PICKUP
            <PlacesSearch
              name='origin_address'
              placeName='origin_place_id'
              icon='arrow-up'
            />
            <FieldError name='origin_address' />
          </Label>
        </Col>
        {!isRoute && (
          <Col xs={12} md={showSideBar ? 12 : 6}>
            <Label>
              DROPOFF
              <PlacesSearch
                name={`stops[0].destination_address`}
                placeName={`stops[0].destination_place_id`}
                icon='arrow-down'
              />
              <FieldError name='stops[0].destination_address' />
            </Label>
          </Col>
        )}
      </Row>
      {isRoute && (
        <Row>
          <Col xs={12} md={4}>
            <Label className='u-push__bottom--none'>DROPOFFS</Label>
          </Col>
          <Col xs={12} md={8}>
            {isRoute && <OptimizeButton />}
            <AddDropoffButton />
          </Col>
        </Row>
      )}
      {isRoute && (
        <DragDropContext onDragEnd={swapStop}>
          <Droppable droppableId='droppable'>
            {provided => (
              <div>
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {stops.map((stop, index) => (
                    <StopFormGroup
                      key={stop.id}
                      stop={stop}
                      index={index}
                      removeStop={() => removeStop(index)}
                      swapStop={swap}
                      showSideBar={showSideBar}
                    />
                  ))}
                  {provided.placeholder}
                </div>

                <Row>
                  <Col xs={12}>
                    {isRoute && <OptimizeButton />}
                    <AddDropoffButton />
                  </Col>
                </Row>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
}
