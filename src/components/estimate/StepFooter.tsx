import { AnchorButton, Button } from '@blueprintjs/core';
import {
  Popover2,
  Popover2InteractionKind,
  Classes,
} from '@blueprintjs/popover2';
import { useFormikContext } from 'formik';
import { useEffect, useState } from 'react';
import { Col, Row } from 'react-flexbox-grid';
import { useSelector } from 'react-redux';
import {
  selectEstimateErrors,
  selectEstimateStatus,
} from '../../lib/reducers/estimateSlice';
import ErrorCallout from '../ErrorCallout';
import FormErrors from '../form/FormErrors';

type StepFooterProps = {
  children?: React.ReactNode;
  onNext?: () => void;
  onPrev?: () => void;
  nextLabel?: string;
  hideRequestError?: boolean;
  isForm?: boolean;
  error?: string | null;
};

export default function StepFooter({
  children,
  onNext,
  onPrev,
  error,
  hideRequestError,
  isForm = true,
  nextLabel = 'Next Step',
}: StepFooterProps) {
  const { isValid, isSubmitting, submitForm, values, initialValues } =
    useFormikContext() ||
    (isForm ? undefined : { isValid: true, isValidating: false });
  const status = useSelector(selectEstimateStatus);
  const estimateError = useSelector(selectEstimateErrors);
  const isLoading = status === 'loading';
  const [attemptNext, setAttemptNext] = useState(false);
  const handleNext = async () => {
    if (isForm) {
      if (values !== initialValues || status === 'failed') await submitForm();
    }
    setAttemptNext(true);
  };

  useEffect(() => {
    if (attemptNext && status !== 'loading') {
      if (status === 'succeeded') {
        onNext?.();
        window.scrollTo(0, 0);
      }
      setAttemptNext(false);
    }
  }, [attemptNext, status, onNext]);

  return (
    <>
      <div className='panelDivider' />
      <Row className='step-footer'>
        <Col xs={12} lg={onNext ? 8 : 12}>
          {!hideRequestError && !isLoading && (
            <ErrorCallout error={estimateError} />
          )}
          {children}
          {onPrev && (
            <Button
              onClick={onPrev}
              disabled={isLoading}
              icon='chevron-left'
              className='u-float--left minimalButton'
              minimal
              large
            >
              Back
            </Button>
          )}
        </Col>
        {onNext && (
          <Col xs={12} lg={4}>
            <Popover2
              interactionKind={Popover2InteractionKind.CLICK}
              className='u-float--right u-width__full u-width__auto--lg'
              popoverClassName={Classes.POPOVER2_CONTENT_SIZING}
              disabled={isValid && !error} // Don't show popover when continuing to next screen is permitted
              content={
                <div>
                  <h3 className='u-push__top--none u-push__bottom--md'>
                    Some issues need corrected
                  </h3>
                  <div>
                    {error ? <p className='error'>{error}</p> : <FormErrors />}
                  </div>
                  <Button className={Classes.POPOVER2_DISMISS}>
                    Understood
                  </Button>
                </div>
              }
            >
              <AnchorButton
                loading={isLoading}
                disabled={!isValid || !!error || isLoading || isSubmitting}
                rightIcon='chevron-right'
                className={
                  'nextStep nextStep-EstimatePage secondaryButtonFilled'
                }
                onClick={handleNext}
                large
                fill
              >
                {nextLabel}
              </AnchorButton>
            </Popover2>
          </Col>
        )}
      </Row>
    </>
  );
}
