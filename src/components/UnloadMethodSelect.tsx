import { Radio, Spinner } from '@blueprintjs/core';
import { useField } from 'formik';
import { Col, Row } from 'react-flexbox-grid';
import { useSelector } from 'react-redux';
import { UnloadMethod } from '../lib/actions/MatchAction';
import {
  selectEstimate,
  selectEstimateStatus,
} from '../lib/reducers/estimateSlice';
import { displayPrice, findFee } from '../lib/Utility';
import BoxTruckAgreement from './estimate/BoxTruckAgreement';
import FormikRadioGroup from './form/FormikRadioGroup';

export function UnloadMethodSelect() {
  const [{ value }] = useField<string>('unload_method');
  const status = useSelector(selectEstimateStatus);
  const match = useSelector(selectEstimate);
  const fee = match && findFee(match.fees, 'lift_gate_fee');
  const feeAmount = fee ? ' – ' + displayPrice(fee.amount) : '...';
  const liftGateFee = status !== 'loading' ? feeAmount : '';

  return (
    <Row className='u-push__top--lg'>
      <Col md={12}>
        <BoxTruckAgreement />
        <FormikRadioGroup
          label='SERVICE TYPE'
          name='unload_method'
          className='u-push__top--lg'
          type='string'
        >
          <Radio
            label='Dock to Dock'
            className='radioLabel'
            value={UnloadMethod.DockToDock}
          />
          <Radio
            label={'Lift Gate' + (value === 'lift_gate' ? liftGateFee : '')}
            className='radioLabel'
            value={UnloadMethod.LiftGate}
            labelElement={
              <label
                htmlFor='Now'
                className='radioLabelInner'
                style={{ color: '#7F7F7F' }}
              >
                – For an additional fee you can order the lift gate service.
              </label>
            }
          >
            {status === 'loading' && value === 'lift_gate' && (
              <Spinner size={16} className='u-display__inline-block' />
            )}
          </Radio>
        </FormikRadioGroup>
      </Col>
    </Row>
  );
}
