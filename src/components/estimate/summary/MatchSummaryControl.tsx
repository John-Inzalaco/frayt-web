import { Collapse, Icon } from '@blueprintjs/core';
import { useState } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import TextButton from '../../TextButton';

export type MatchSummaryControlProps = {
  initialIsOpen: boolean;
  onReview: () => void;
  children: React.ReactNode;
  info?: React.ReactNode;
  header: React.ReactNode;
};

export default function MatchSummaryControl({
  header,
  children,
  info,
  initialIsOpen,
  onReview,
}: MatchSummaryControlProps) {
  const [isOpen, setIsOpen] = useState(initialIsOpen);

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <ReactCSSTransitionGroup
      transitionName='basic'
      transitionAppear={true}
      transitionAppearTimeout={450}
      transitionEnter={false}
      transitionLeave={false}
    >
      <div className='reviewBox'>
        <h2 style={{ cursor: 'pointer' }} onClick={toggleOpen}>
          {header}
          <TextButton className='reviewLink' onClick={onReview}>
            REVIEW
            <Icon icon='chevron-right' />
          </TextButton>
        </h2>
        {info && info}
        <Collapse isOpen={isOpen}>{children}</Collapse>
      </div>
    </ReactCSSTransitionGroup>
  );
}
