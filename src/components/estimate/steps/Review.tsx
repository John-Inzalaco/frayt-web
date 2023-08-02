import { useNavigate } from 'react-router-dom';
import 'moment-timezone';
import { PriceBreakdown } from '../PriceBreakdown';
import StepFooter from '../StepFooter';
import { ShipTabProps } from '../../../screens/ShipScreen';
import { useSelector } from 'react-redux';
import {
  authorizeEstimate,
  selectEstimate,
} from '../../../lib/reducers/estimateSlice';
import Summaries from '../summary/Summaries';
import { useAppDispatch } from '../../../lib/store';

export default function Review({ changeTab }: ShipTabProps) {
  const initialOpen = window.innerWidth > 767;
  const match = useSelector(selectEstimate);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleNext = () => {
    if (match) {
      dispatch(authorizeEstimate(match.id))
        .unwrap()
        .then(() => {
          sessionStorage.removeItem('weightInfo');
          navigate('/matches/' + match.id);
        });
    }
  };

  return (
    <div>
      <h1 className='u-push__bottom--md u-push__top--none'>Review Match</h1>
      <p className='u-push__bottom--lg'>
        We now have everything we need, so review your details for accuracy then
        click the Ship button at the bottom of this page to place your order
        once you have confirmed the final estimate.
      </p>
      <h2>Final Estimate</h2>
      {match?.total_price && <PriceBreakdown match={match} />}
      <br />
      <div className='reviewBoxInternal'>
        <Summaries
          match={match}
          changeTab={changeTab}
          initialOpen={initialOpen}
        />
      </div>

      <StepFooter
        onPrev={() => changeTab(-1)}
        onNext={handleNext}
        nextLabel='Ship'
        isForm={false}
      />
    </div>
  );
}
