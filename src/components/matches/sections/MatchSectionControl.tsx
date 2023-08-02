import { Icon } from '@blueprintjs/core';
import { Match } from '../../../lib/actions/MatchAction';
import TextButton from '../../TextButton';

export type MatchSectionControlProps = {
  title: string;
  children: React.ReactNode;
} & Pick<MatchSectionProps, 'goBack' | 'showMore' | 'isActive'>;

export type MatchSectionProps = {
  match: Match;
  goBack: () => void;
  showMore: () => void;
  isActive: boolean;
};

export default function MatchSectionControl({
  goBack,
  showMore,
  isActive,
  title,
  children,
}: MatchSectionControlProps) {
  return (
    <div>
      {isActive && (
        <TextButton className='backLink' onClick={goBack}>
          <Icon icon='chevron-left' />
          BACK
        </TextButton>
      )}

      <div className='reviewBox'>
        <h2>
          {title}
          {!isActive && (
            <TextButton className='reviewLink' onClick={showMore}>
              MORE
              <Icon icon='chevron-right' />
            </TextButton>
          )}
        </h2>
        {children}
      </div>
    </div>
  );
}
