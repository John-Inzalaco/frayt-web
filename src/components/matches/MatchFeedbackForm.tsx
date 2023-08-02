import { Button, FormGroup, HTMLSelect, TextArea } from '@blueprintjs/core';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import { useState } from 'react';
import { Col, Row } from 'react-flexbox-grid';
import { Match } from '../../lib/actions/MatchAction';
import { getErrorMessage } from '../../lib/FraytRequest';
import { updateMatch } from '../../lib/reducers/matchesSlice';
import { useAppDispatch } from '../../lib/store';

enum BlameType {
  Driver,
  App,
  Support,
}

const blameOptions = [
  { value: '', label: '- Select Reason -' },
  { value: BlameType.Driver, label: 'Issue with driver' },
  { value: BlameType.App, label: 'Issue with app' },
  { value: BlameType.Support, label: 'Issue with customer support' },
];

const driverOptions = [
  { value: '', label: '- Select Reason -' },
  {
    value: 'The driver was not on time',
    label: 'The driver was not on time',
  },
  {
    value: 'The driver was uncooperative',
    label: 'The driver was uncooperative',
  },
  {
    value: 'The driver was unresponsive',
    label: 'The driver was unresponsive',
  },
  { value: 'Other', label: 'Other driver issue' },
];

const appOptions = [
  { value: '', label: '- Select Reason -' },
  {
    value: 'I had a problem with the app',
    label: 'I had a problem with the app',
  },
  {
    value: 'I couldn’t track the driver',
    label: 'I couldn’t track the driver',
  },
  { value: 'Other', label: 'Other app issue' },
];

const supportOptions = [
  { value: '', label: '- Select Reason -' },
  {
    value: 'Support was not able to help me',
    label: 'Support was not able to help me',
  },
  { value: 'Support was unresponsive', label: 'Support was unresponsive' },
  { value: 'Other', label: 'Other support issue' },
];

const getReasonOptions = (blame: BlameType) => {
  switch (blame) {
    case BlameType.App:
      return appOptions;

    case BlameType.Driver:
      return driverOptions;

    case BlameType.Support:
      return supportOptions;
    default:
      return [];
  }
};

type FeedbackValues = {
  blame: BlameType | '';
  reason: string;
  customReason: string;
};

type MatchFeedbackFormProps = { match: Match; rating: number };

export default function MatchFeedbackForm({
  match,
  rating,
}: MatchFeedbackFormProps) {
  const dispatch = useAppDispatch();
  const [error, setError] = useState<null | string>(null);
  const initialValues: FeedbackValues = {
    blame: '',
    reason: '',
    customReason: '',
  };

  const handleSubmit = async (
    { reason, customReason }: FeedbackValues,
    actions: FormikHelpers<FeedbackValues>
  ) => {
    const data = {
      rating,
      rating_reason: reason === 'Other' ? customReason : reason,
    };

    const action = dispatch(updateMatch([match.id, data]));

    try {
      await action.unwrap();
    } catch (error) {
      actions.setSubmitting(false);
      setError(getErrorMessage(error));
    }
  };

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {({ values, isSubmitting }) => (
        <Form>
          {error && (
            <p className='warningMessage' style={{ marginTop: '-5px' }}>
              {error}
            </p>
          )}
          <p style={{ marginBottom: 15 }}>What went wrong with this match?</p>
          <FormGroup label='Reason' labelFor='blame' labelInfo='(Required)'>
            <Field
              as={HTMLSelect}
              id='blame'
              name='blame'
              className='select'
              options={blameOptions}
              large
              required
            />
          </FormGroup>

          {values.blame ? (
            <Field
              as={HTMLSelect}
              id='reason'
              name='reason'
              className='select'
              options={getReasonOptions(values.blame)}
              large
              required
            />
          ) : null}

          {values.reason === 'Other' ? (
            <FormGroup
              label='Other'
              labelFor='customReason'
              labelInfo='(Required)'
            >
              <Field
                as={TextArea}
                name='customReason'
                id='customReason'
                style={{ font: 'inherit' }}
                required
                large
                fill
              />
            </FormGroup>
          ) : null}

          <Row end='xs' between='xs'>
            <Col sm xs={12}>
              <Button
                type='submit'
                large
                loading={isSubmitting}
                disabled={isSubmitting || !values.reason}
                rightIcon={'chevron-right'}
                className='no-wrap warningButton'
                style={{ marginTop: 15 }}
              >
                Submit
              </Button>
            </Col>
          </Row>
        </Form>
      )}
    </Formik>
  );
}
