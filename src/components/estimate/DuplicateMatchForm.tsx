import { Button, Callout, FormGroup, InputGroup } from '@blueprintjs/core';
import { Field, Formik, yupToFormErrors } from 'formik';
import moment from 'moment';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Match, MatchData } from '../../lib/actions/MatchAction';
import {
  authorizeEstimate,
  duplicateMatch,
  selectEstimate,
  selectEstimateErrors,
  selectEstimateStatus,
} from '../../lib/reducers/estimateSlice';
import { useAppDispatch } from '../../lib/store';
import EstimateBanner from './EstimateBanner';
import MatchScheduler, {
  matchScheduleSchema,
  ScheduleValues,
} from './MatchScheduler';

type DuplicateMatchFormProps = {
  match: Match;
  onDone: () => void;
};

type DuplicateMatchValues = ScheduleValues &
  PickRequired<MatchData, 'po' | 'coupon_code'>;

export default function DuplicateMatchForm({
  match,
  onDone,
}: DuplicateMatchFormProps) {
  const estimate = useSelector(selectEstimate);
  const error = useSelector(selectEstimateErrors);
  const status = useSelector(selectEstimateStatus);
  const dispatch = useAppDispatch();
  const [initialValues, setInitialValues] = useState<DuplicateMatchValues>({
    vehicle_class: match.vehicle_class,
    po: match.po,
    service_level: match.service_level,
    pickup_at: null,
    dropoff_at: null,
    coupon_code: null,
    scheduled: false,
    timezone: moment.tz.guess(),
  });
  const navigate = useNavigate();
  const getEstimate = (values: DuplicateMatchValues) => {
    dispatch(duplicateMatch([match.id, values])).then(() => {
      setInitialValues(values);
    });
  };

  const authorize = () => {
    if (estimate) {
      dispatch(authorizeEstimate(estimate.id)).then(() => {
        onDone();
        navigate(`/matches/${estimate.id}`);
      });
    }
  };

  const validate = (values: DuplicateMatchValues) => {
    try {
      matchScheduleSchema.validateSync(values, {
        abortEarly: false,
        context: values,
      });
    } catch (e) {
      return yupToFormErrors(e); //for rendering validation errors
    }
  };

  return (
    <Formik<DuplicateMatchValues>
      initialValues={initialValues}
      onSubmit={getEstimate}
      enableReinitialize={true}
      validate={validate}
    >
      {formik => (
        <form onSubmit={formik.handleSubmit}>
          <FormGroup label='PO' labelFor='po'>
            <Field as={InputGroup} name='po' />
          </FormGroup>

          <div className='panelDivider' />

          <MatchScheduler />

          <div className='panelDivider' />

          <FormGroup label='Coupon' labelFor='coupon_code'>
            <Field as={InputGroup} name='coupon_code' />
          </FormGroup>

          <div className='panelDivider' />

          {error && (
            <Callout
              intent={'danger'}
              title={'There was an error.'}
              style={{ marginBottom: 20 }}
            >
              {error}
            </Callout>
          )}

          <EstimateBanner />

          <Button type='button' className='warningButton' onClick={onDone}>
            Cancel
          </Button>

          {!estimate || formik.dirty ? (
            <Button
              type='submit'
              className='secondaryButtonFilled'
              style={{ float: 'right' }}
              disabled={
                status === 'loading' || !formik.isValid || !formik.dirty
              }
            >
              Get Estimate
            </Button>
          ) : (
            <Button
              type='button'
              className='secondaryButtonFilled'
              style={{ float: 'right' }}
              onClick={() => authorize()}
              disabled={status === 'loading'}
            >
              Authorize Match
            </Button>
          )}
        </form>
      )}
    </Formik>
  );
}
