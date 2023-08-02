import { Checkbox, FormGroup, InputGroup } from '@blueprintjs/core';
import { Field, useField } from 'formik';
import { Col, Row } from 'react-flexbox-grid';
import FieldError from '../form/FieldError';
import FormikPhoneInput from '../form/FormikPhoneInput';

type ContactFormGroupProps = {
  name: string;
  label: string;
};

export default function ContactFormGroup({
  name,
  label,
}: ContactFormGroupProps) {
  const [{ value: notify }] = useField<boolean>(`${name}.notify`);

  return (
    <Row>
      <Col xs={12} lg={6}>
        <FormGroup label='NAME' labelFor={`${name}.name`}>
          <Field as={InputGroup} name={`${name}.name`} />
          <FieldError name={`${name}.name`} ignoreTouched />
        </FormGroup>
      </Col>
      <Col xs={12} lg={6}>
        <FormGroup label='SEND NOTIFICATIONS' labelFor={`${name}.notify`}>
          <Field as={Checkbox} name={`${name}.notify`} checked={notify}>
            Contact will recieve updates concerning this {label}
          </Field>
          <FieldError name={`${name}.notify`} ignoreTouched />
        </FormGroup>
      </Col>
      <Col xs={12} lg={6}>
        <FormGroup label='PHONE' labelFor={`${name}.phone_number`}>
          <FormikPhoneInput
            name={`${name}.phone_number`}
            placeholder='Enter phone number'
            defaultCountry='US'
          />
          <FieldError name={`${name}.phone_number`} ignoreTouched />
        </FormGroup>
      </Col>
      <Col xs={12} lg={6}>
        <FormGroup label='EMAIL' labelFor={`${name}.email`}>
          <Field as={InputGroup} name={`${name}.email`} type='email' />
          <FieldError name={`${name}.email`} ignoreTouched />
        </FormGroup>
      </Col>
    </Row>
  );
}
