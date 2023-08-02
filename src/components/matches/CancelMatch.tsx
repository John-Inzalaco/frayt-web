import { useState } from 'react';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import { Button, FormGroup, HTMLSelect, TextArea } from '@blueprintjs/core';
import { Grid, Row, Col } from 'react-flexbox-grid';
import { useAppDispatch } from '../../lib/store';
import { cancelMatch } from '../../lib/reducers/matchesSlice';
import { Match } from '../../lib/actions/MatchAction';
import { getErrorMessage } from '../../lib/FraytRequest';

const reasonOptions = [
  { value: '', label: '- Select Reason -' },
  { value: 'Service Failure', label: 'Service Failure' },
  { value: 'Mistakenly Placed Match', label: 'Mistakenly Placed Match' },
  { value: 'No Longer Need Match', label: 'No Longer Need Match' },
  { value: 'Other', label: 'Other' },
];

type CancelValues = {
  reason: string;
  other: string;
};

type CancelMatchProps = {
  match: Match;
};

export default function CancelMatch({ match }: CancelMatchProps) {
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const dispatch = useAppDispatch();

  const handleFormSubmit = async (
    values: CancelValues,
    actions: FormikHelpers<CancelValues>
  ) => {
    setError(null);

    let reason = values.reason;
    if (values.reason === 'Other') {
      reason = values.other;
    }

    const action = dispatch(cancelMatch([match.id, reason]));

    try {
      await action.unwrap();
    } catch (e) {
      setError(getErrorMessage(e));
      actions.setSubmitting(false);
    }
  };

  const toggleForm = () => {
    setError(null);
    setShowForm(!showForm);
  };

  const initialValues: CancelValues = { reason: '', other: '' };

  if (showForm === true) {
    return (
      <div className='reviewBox'>
        <Grid>
          <Row>
            <h2>Cancel Match </h2>
          </Row>
          {error && <p className='warningMessage'>{error}</p>}
          <div className='infoBox u-push__top--xs'>
            <Formik initialValues={initialValues} onSubmit={handleFormSubmit}>
              {({ values, isSubmitting }) => (
                <Form>
                  <p className='u-push__bottom--lg'>
                    Are you sure you want to cancel this match?
                  </p>
                  <FormGroup
                    label='Cancellation Reason'
                    labelFor='reason'
                    labelInfo='(Required)'
                  >
                    <Field
                      as={HTMLSelect}
                      name='reason'
                      options={reasonOptions}
                      className='select'
                      required
                      large
                    />
                  </FormGroup>
                  {values.reason === 'Other' ? (
                    <FormGroup
                      label='Other'
                      labelFor='other'
                      labelInfo='(Required)'
                    >
                      <Field
                        as={TextArea}
                        name='other'
                        className='select'
                        required
                        large
                        fill
                        style={{ font: 'inherit' }}
                      />
                    </FormGroup>
                  ) : null}
                  <Row end='xs' between='xs'>
                    <Col sm xs={12}>
                      <Button
                        className='no-wrap buttonSecondary u-push__right--sm'
                        large
                        onClick={toggleForm}
                      >
                        Back
                      </Button>
                      <Button
                        type='submit'
                        large
                        loading={isSubmitting}
                        disabled={isSubmitting || !values.reason}
                        rightIcon={'chevron-right'}
                        className='no-wrap warningButton'
                      >
                        Cancel Match
                      </Button>
                    </Col>
                  </Row>
                </Form>
              )}
            </Formik>
          </div>
        </Grid>
      </div>
    );
  } else {
    return (
      <div className='reviewBox'>
        <Grid>
          <Row>
            <Col xs={12} sm>
              <h2>Cancel Match </h2>
            </Col>
            <Col xs={12} sm className='shrink'>
              <Button
                large={true}
                rightIcon='chevron-right'
                className='no-wrap warningButton u-push__top--xs'
                onClick={toggleForm}
              >
                Cancel Match
              </Button>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}
