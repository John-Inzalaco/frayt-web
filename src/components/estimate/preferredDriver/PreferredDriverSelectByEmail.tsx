import {
  Button,
  Callout,
  InputGroup,
  Menu,
  MenuItem,
  Text,
} from '@blueprintjs/core';
import { Formik, FormikHelpers } from 'formik';
import { Col, Row } from 'react-flexbox-grid';
import * as yup from 'yup';
import { SchemaOf } from 'yup';
import { getPreferredDriverByEmail } from '../../../lib/actions/UserAction';
import { Driver } from '../../../lib/actions/MatchAction';
import { getErrorMessage } from '../../../lib/FraytRequest';
import { Popover2 } from '@blueprintjs/popover2';
import { useState } from 'react';

export type SelectByEmailValues = { email?: string };
const selectByEmailSchema: SchemaOf<SelectByEmailValues> = yup.object().shape({
  email: yup.string().notRequired(),
});

type PreferredDriverSelectByEmailProps = {
  currentPreferredDriver: Driver | undefined;
  onSelect?: (driver: Driver | undefined) => void;
};

export default function PreferredDriverSelectByEmail({
  currentPreferredDriver,
  onSelect,
}: PreferredDriverSelectByEmailProps) {
  const [selectedDriverOption, setSelectedDriverOption] = useState<
    Driver | undefined
  >(currentPreferredDriver);
  const [showDriverOption, setShowDriverOption] = useState(false);

  const handleSubmit = async (
    values: SelectByEmailValues,
    { setFieldError }: FormikHelpers<SelectByEmailValues>
  ) => {
    const { email } = values;
    if (!email) return setShowDriverOption(false);

    try {
      const {
        data: { data: result },
      } = await getPreferredDriverByEmail({ email: email });
      if (result.length <= 0)
        throw new Error(
          'No FRAYT driver found with that email address. Please try a different email address.'
        );
      setSelectedDriverOption(result[0]);
    } catch (e) {
      setFieldError('email', getErrorMessage(e));
      setSelectedDriverOption(undefined);
      if (onSelect) onSelect(undefined);
    } finally {
      setShowDriverOption(true);
    }
  };

  const renderOption = () => {
    if (selectedDriverOption) {
      return (
        <Menu style={{ width: '100%' }}>
          <MenuItem
            text={`${selectedDriverOption.first_name} ${selectedDriverOption.last_name}`}
            onClick={() => {
              setShowDriverOption(false);
              if (onSelect) onSelect(selectedDriverOption);
            }}
          ></MenuItem>
        </Menu>
      );
    }
  };

  return (
    <Col xs={12} className='u-push__top--lg'>
      <Row>
        <Col xs={12}>
          <Formik
            validateOnMount
            initialValues={{ email: '' } as SelectByEmailValues}
            validationSchema={selectByEmailSchema}
            onSubmit={handleSubmit}
          >
            {({ submitForm, handleChange, errors }) => (
              <>
                <Popover2
                  className='selectByEmailPopover'
                  isOpen={showDriverOption}
                  placement='bottom'
                  matchTargetWidth={true}
                  minimal={true}
                  content={renderOption()}
                >
                  <InputGroup
                    placeholder='user@frayt.com'
                    name='email'
                    fill={true}
                    asyncControl={true}
                    onChange={handleChange}
                    rightElement={
                      <Button
                        className='selectByEmailButton'
                        icon='search'
                        minimal={true}
                        onClick={() => submitForm()}
                      />
                    }
                    onKeyDown={event => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        submitForm();
                      }
                    }}
                  />
                </Popover2>
                {currentPreferredDriver && (
                  <Callout
                    className='preferredDriverSelectCallout'
                    intent='success'
                  >
                    Sucessfully assigned {currentPreferredDriver.first_name}{' '}
                    {currentPreferredDriver.last_name} (
                    {currentPreferredDriver.email}) as the preferred driver for
                    your order.
                  </Callout>
                )}
                {errors.email && (
                  <Callout
                    className='preferredDriverSelectCallout'
                    intent='danger'
                  >
                    {errors.email}
                  </Callout>
                )}
              </>
            )}
          </Formik>
        </Col>
      </Row>
    </Col>
  );
}
