import { useState } from 'react';
import { Formik, FormikHelpers } from 'formik';
import { Button, Card, Elevation } from '@blueprintjs/core';
import { Grid, Row, Col } from 'react-flexbox-grid';
import AgreementInput, {
  agreementsSchema,
  initialAgreementsValues,
} from '../components/user/auth/AgreementInput';
import ErrorCallout from '../components/ErrorCallout';
import { AgreementData } from '../lib/actions/UserAction';
import { useAppDispatch } from '../lib/store';
import { useSelector } from 'react-redux';
import {
  logoutUser,
  selectUser,
  updateUserAgreements,
} from '../lib/reducers/userSlice';
import TextButton from '../components/TextButton';
import { getErrorMessage } from '../lib/FraytRequest';

type AgreementFormValues = {
  agreements: AgreementData[];
};

export default function AgreementScreen() {
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const user = useSelector(selectUser);
  const agreements = user?.pending_agreements || [];
  const initialValues = { agreements: initialAgreementsValues(agreements) };

  const handleSubmit = async (
    values: AgreementFormValues,
    { setSubmitting }: FormikHelpers<AgreementFormValues>
  ) => {
    setError(null);
    const action = dispatch(updateUserAgreements(values.agreements));

    try {
      await action.unwrap();
    } catch (e) {
      setError(getErrorMessage(e));
    }

    setSubmitting(false);
  };

  const logout = async () => {
    await dispatch(logoutUser());

    window.location.reload();
  };

  return (
    <div className='appContent'>
      <Grid>
        <Row className='appCushion'>
          <ErrorCallout error={error} />
        </Row>
        <Row>
          <Col xs={12} md={12} className='accountCol'>
            <Card
              interactive={false}
              elevation={Elevation.ONE}
              className='infoCard'
              style={{ marginBottom: 20 }}
            >
              <h2>Agreements</h2>
              <p>
                We have updated our terms and conditions. Please read each one
                carefully by clicking the links below.
              </p>
              <p>
                To continue using our services, please agree to our updated
                terms. If you do not agree you can{' '}
                <TextButton onClick={logout}>Log Out</TextButton>
              </p>

              <Formik
                initialValues={initialValues}
                validationSchema={agreementsSchema}
                onSubmit={handleSubmit}
              >
                {formik => (
                  <form onSubmit={formik.handleSubmit}>
                    {agreements.map((agreement, index) => (
                      <AgreementInput
                        key={agreement.id}
                        agreement={agreement}
                        index={index}
                        className='agreement-light'
                      />
                    ))}

                    <Button
                      text='Submit'
                      loading={formik.isSubmitting}
                      disabled={
                        formik.isSubmitting || !formik.isValid || !formik.dirty
                      }
                      large
                      type='submit'
                    />
                  </form>
                )}
              </Formik>
            </Card>
          </Col>
        </Row>
      </Grid>
    </div>
  );
}
