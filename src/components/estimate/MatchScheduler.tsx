import { Button, Checkbox, Radio } from '@blueprintjs/core';
import { useFormikContext } from 'formik';
import moment, { Moment } from 'moment';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { MatchData, ServiceLevel } from '../../lib/actions/MatchAction';
import DateTimeTZInput from '../form/DateTimeTZInput';
import FormikRadioGroup from '../form/FormikRadioGroup';
import * as yup from 'yup';
import { SchemaOf, TestContext } from 'yup';
import { isObject } from '../../lib/Utility';
import FieldError from '../form/FieldError';
import { Col, Row } from 'react-flexbox-grid';

export type ScheduleValues = { timezone: string } & PickRequired<
  MatchData,
  'service_level' | 'scheduled'
> &
  PickOptional<MatchData, 'dropoff_at' | 'pickup_at' | 'vehicle_class'>;

export function isScheduleValues(values: unknown): values is ScheduleValues {
  return isObject(values, ['service_level', 'scheduled', 'timezone']);
}

function validatePickupDate(
  pickup_at: ScheduleValues['pickup_at'],
  context: TestContext<unknown>
) {
  const values = context.options.context;
  if (isScheduleValues(values)) {
    const { dropoff_at } = values;
    if (
      pickup_at &&
      dropoff_at &&
      moment(pickup_at).diff(moment(dropoff_at)) > 0
    ) {
      return false;
    }
  }

  return true;
}

function getBlockedDate(
  datetime: Moment | null,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  values: ScheduleValues
): string | null {
  if (datetime?.month() === 11 && datetime.date() === 25)
    return 'on Christmas Day';
  return null;
}

function getDisabledDates(values: ScheduleValues) {
  const start = moment().tz(values.timezone);
  const end = start.clone().add(60, 'days');
  const days: Moment[] = [];
  let current = start;

  while (end.isSameOrAfter(current)) {
    if (getBlockedDate(current, values)) {
      days.push(current);
    }
    current = current.clone().add(1, 'day');
  }

  return days;
}

function validateOperationalDay(name: string) {
  return (
    value: Moment | string | null | undefined,
    { options, createError, path }: TestContext<unknown>
  ) => {
    const values = options.context;
    if (isScheduleValues(values)) {
      const error = getBlockedDate(value ? moment(value) : null, values);

      if (error) {
        return createError({ message: name + ' ' + error, path });
      }
    }
    return true;
  };
}

export const matchScheduleSchema: SchemaOf<
  Omit<ScheduleValues, 'vehicle_class'>
> = yup.object({
  scheduled: yup
    .bool()
    .required('Date is required')
    .test('nowIsOperationalDay', (scheduled, values) =>
      scheduled === false
        ? validateOperationalDay('Matches cannot be placed')(moment(), values)
        : true
    ),
  pickup_at: yup
    .string()
    .nullable()
    .when('scheduled', {
      is: true,
      then: yup.string().required('Pickup time is required for scheduling'),
    })
    .test(
      'pickupIsBeforeDropoff',
      'Pickup time must be before dropoff time',
      validatePickupDate
    )
    .test(
      'pickupIsOperationalDay',
      validateOperationalDay('Pickup time cannot be')
    ),
  dropoff_at: yup
    .string()
    .nullable()
    .test(
      'dropoffIsOperationalDay',
      validateOperationalDay('Dropoff time cannot be')
    ),
  service_level: yup.number().required('Service level is required'),
  timezone: yup.string().required(),
});

type ScheduledInputProps = {
  name: string;
};

function ScheduledInput({ name }: ScheduledInputProps) {
  const {
    setFieldValue,
    values: { dropoff_at, scheduled, pickup_at, service_level, timezone },
  } = useFormikContext<ScheduleValues>();

  const now = moment().tz(timezone);

  const blockToday =
    service_level === ServiceLevel.SameDay && now.hours() >= 17;

  useEffect(() => {
    if (blockToday && !scheduled) {
      setFieldValue('scheduled', undefined, true);
    }
  }, [scheduled, blockToday, setFieldValue]);

  useEffect(() => {
    if (!scheduled) {
      if (pickup_at) {
        setFieldValue('pickup_at', undefined, true);
      }

      if (dropoff_at) {
        setFieldValue('dropoff_at', undefined, true);
      }
    }
  }, [scheduled, pickup_at, dropoff_at, setFieldValue]);

  return (
    <FormikRadioGroup label='DATE' name={name} type='boolean'>
      <Radio
        label={service_level === ServiceLevel.SameDay ? 'Today' : 'Now'}
        className='radioLabel'
        value='false'
        disabled={blockToday}
        labelElement={
          <label htmlFor='Now' className='radioLabelInner'>
            – Ready for pickup now{' '}
            {blockToday ? (
              <span className='u-text--warning'>
                <br />– Not available for today after 5pm
              </span>
            ) : (
              ''
            )}
          </label>
        }
      />
      <Radio
        label='Later'
        className='radioLabel'
        value='true'
        labelElement={
          <label htmlFor='Later' className='radioLabelInner'>
            – Schedule for later
          </label>
        }
      />
      <FieldError name={name} ignoreTouched />
    </FormikRadioGroup>
  );
}

type ServiceLevelInputProps = {
  name: string;
};

function ServiceLevelInput({ name }: ServiceLevelInputProps) {
  return (
    <FormikRadioGroup label='SERVICE LEVEL' name={name} type='number'>
      <FieldError name={name} ignoreTouched />
      <Radio
        label='Dash'
        className='radioLabel'
        value={ServiceLevel.Dash}
        labelElement={
          <label htmlFor='Now' className='radioLabelInner'>
            – Picked up and delivered ASAP
          </label>
        }
      />
      <Radio
        label='Same Day'
        className='radioLabel'
        value={ServiceLevel.SameDay}
        labelElement={
          <label htmlFor='Now' className='radioLabelInner'>
            – Delivery by 5pm
            <br />– Must be placed before 12pm
          </label>
        }
      />
    </FormikRadioGroup>
  );
}

function DateInputs() {
  const [dropoffScheduled, setDropoffScheduled] = useState(false);
  const { setFieldValue, setFieldTouched, values } =
    useFormikContext<ScheduleValues>();
  const { service_level, dropoff_at, scheduled } = values;
  const isSameDay = service_level === ServiceLevel.SameDay;

  const toggleDropoffScheduled = useCallback(
    (scheduled: boolean) => {
      if (!scheduled) {
        setFieldTouched('dropoff_at', false);
        setFieldValue('dropoff_at', null, true);
      }
      setDropoffScheduled(scheduled);
    },
    [setFieldValue, setFieldTouched]
  );

  useEffect(() => {
    if (isSameDay && (dropoffScheduled || dropoff_at)) {
      toggleDropoffScheduled(false);
    }
  }, [
    service_level,
    isSameDay,
    dropoff_at,
    dropoffScheduled,
    toggleDropoffScheduled,
  ]);

  useEffect(() => {
    if (scheduled) {
      if (dropoff_at && !dropoffScheduled) {
        setDropoffScheduled(true);
      }
    } else if (dropoffScheduled) {
      setDropoffScheduled(false);
    }
  }, [dropoff_at, dropoffScheduled, scheduled]);

  const disabledDates = useMemo(() => getDisabledDates(values), [values]);

  const defaultTime = new Date();

  defaultTime.setHours(12, 12, 0, 0);

  const minDate = moment().add(90, 'minutes');
  const maxDate = moment().add(365, 'days');

  return (
    <Row>
      <Col xs={12} md={6}>
        <h3>Pickup Time</h3>
        <DateTimeTZInput
          placeholder='Select Time'
          name='pickup_at'
          timezoneName='timezone'
          disabledDates={disabledDates}
          defaultTime={defaultTime}
          minDate={minDate}
          maxDate={maxDate}
          stepSize={15}
        />
        <FieldError name='pickup_at' />
      </Col>
      <Col xs={12} md={6}>
        <h3>
          Dropoff Time{' '}
          <Checkbox
            checked={!dropoffScheduled}
            label='ASAP'
            name='asap'
            onChange={event =>
              toggleDropoffScheduled(!event.currentTarget.checked)
            }
            className='inlineCheckbox'
            disabled={isSameDay}
          />
        </h3>
        {dropoffScheduled ? (
          <>
            <DateTimeTZInput
              placeholder='Select Time'
              name='dropoff_at'
              timezoneName='timezone'
              disabledDates={disabledDates}
              defaultTime={defaultTime}
              minDate={minDate}
              maxDate={maxDate}
              stepSize={15}
            />
            <FieldError name='dropoff_at' />
          </>
        ) : (
          <div>
            <p>
              {isSameDay ? (
                <span>
                  It will be delivered by 5pm. Setting a dropoff time is not
                  available for the Same Day service level.
                </span>
              ) : (
                <span>
                  It will be delivered <b>as soon as possible</b>.To pick a
                  specific time, uncheck the ASAP checkbox above.
                </span>
              )}
            </p>
            <Button
              className='secondaryButton dropoffMobileButton'
              minimal
              icon='time'
              onClick={() => toggleDropoffScheduled(true)}
              fill
              disabled={isSameDay}
            >
              Choose Time
            </Button>
          </div>
        )}
      </Col>
    </Row>
  );
}

export default function MatchScheduler() {
  const {
    values: { scheduled },
  } = useFormikContext<ScheduleValues>();

  return (
    <div className='MatchScheduler'>
      <div className='MatchScheduler__container'>
        <ServiceLevelInput name='service_level' />
      </div>
      <div className='panelDivider' />
      <div className='MatchScheduler__container'>
        <ScheduledInput name='scheduled' />
      </div>

      {scheduled && <DateInputs />}
    </div>
  );
}
