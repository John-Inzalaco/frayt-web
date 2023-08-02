import { useSelector } from 'react-redux';
import { selectCreditCard, selectUser } from '../../../lib/reducers/userSlice';
import { getUserCompany } from '../../../lib/Utility';
import MatchSummaryControl, {
  MatchSummaryControlProps,
} from './MatchSummaryControl';

export default function Payment(
  props: Omit<MatchSummaryControlProps, 'header' | 'children'>
) {
  const user = useSelector(selectUser);
  const creditCard = useSelector(selectCreditCard);
  const company = getUserCompany(user);

  return (
    <MatchSummaryControl header='Payment' {...props}>
      <div className='infoBox infoBox--row'>
        {company?.account_billing_enabled ? (
          <div>
            <p className='heading'>ACCOUNT BILLING</p>
            <p>Invoiced on Net {company?.invoice_period}</p>
          </div>
        ) : (
          <div>
            <p className='heading'>CREDIT CARD</p>
            <p>**** **** **** {creditCard}</p>
          </div>
        )}
      </div>
    </MatchSummaryControl>
  );
}
