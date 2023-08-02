import { FormGroup, InputGroup, Label } from '@blueprintjs/core';
import { Field, useField, useFormikContext } from 'formik';
import { Col, Row } from 'react-flexbox-grid';
import { VehicleClass } from '../../lib/actions/MatchAction';
import FieldError from '../form/FieldError';
import { FieldsError } from '../form/FieldsError';
import ItemTypeToggle from './ItemTypeToggle';
import VolumeInput from './VolumeInput';
import MoneyInput from '../form/MoneyInput';
import { CargoStopItemValues, CargoValues } from './steps/Cargo';
import DecimalInput from '../form/DecimalInput';
import WeightInput from '../form/WeightInput';

type ItemFormGroupProps = {
  name: string;
};

export default function ItemFormGroup({ name }: ItemFormGroupProps) {
  const { values } = useFormikContext<CargoValues>();
  const [{ value: item }] = useField<CargoStopItemValues>(name);
  const colWidth = 12;

  return (
    <div className='item-form-group'>
      <Row>
        <Col md={6}>
          <FormGroup label='PIECES' labelFor={`${name}.pieces`}>
            <Field as={InputGroup} name={`${name}.pieces`} type='number' />
            <FieldError name={`${name}.pieces`} />
          </FormGroup>
        </Col>
        <Col md={6}>
          <FormGroup label='DESCRIPTION' labelFor={`${name}.description`}>
            <Field as={InputGroup} name={`${name}.description`} />
            <FieldError name={`${name}.description`} />
          </FormGroup>
        </Col>
      </Row>
      <Row>
        {item.type !== 'pallet' && (
          <Col md={colWidth}>
            <Row>
              <Col md={12}>
                <Label className='u-push__bottom--xs'>DIMENSIONS</Label>
              </Col>
              <Col md={8}>
                <div className='item-form-group__dimensions'>
                  <DecimalInput
                    label='W (in)'
                    name={`${name}.width`}
                    decimals={0}
                    showError={false}
                  />
                  <DecimalInput
                    label='L (in)'
                    name={`${name}.length`}
                    decimals={0}
                    showError={false}
                  />
                  <DecimalInput
                    label='H (in)'
                    name={`${name}.height`}
                    decimals={0}
                    showError={false}
                  />
                </div>
                <FieldsError
                  names={[`${name}.width`, `${name}.length`, `${name}.height`]}
                />
              </Col>
              <Col md={4}>
                <VolumeInput name={`${name}.volume`} item={item} />
              </Col>
            </Row>
          </Col>
        )}

        <Col md={colWidth}>
          <WeightInput parentName={name} name={`${name}.weight`} />
          <FieldError name={`declared_value`} />
        </Col>
      </Row>
      <Row>
        <Col md={colWidth}>
          <MoneyInput
            name={`${name}.declared_value`}
            label='DECLARED VALUE'
            leftIcon='dollar'
            type='number'
            ignoreTouched={false}
          />
          <FieldError name={`declared_value`} />
        </Col>
      </Row>
      {values.vehicle_class === VehicleClass.BoxTruck && (
        <Row>
          <Col xs={12}>
            <ItemTypeToggle name={`${name}.type`} />
            <FieldError name={`${name}.type`} />
          </Col>
        </Row>
      )}
    </div>
  );
}
