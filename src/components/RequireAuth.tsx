import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { ShipperState } from '../lib/actions/ShipperAction';
import { selectAuthStatus, selectUser } from '../lib/reducers/userSlice';
import DisabledScreen from '../screens/DisabledScreen';

type RequireAuthProps = {
  children: JSX.Element;
  showUnauthenticated?: boolean;
};

export default function RequireAuth({
  children,
  showUnauthenticated,
}: RequireAuthProps) {
  const location = useLocation();
  const authStatus = useSelector(selectAuthStatus);
  const user = useSelector(selectUser);
  const isAuthorized = authStatus === 'succeeded' || showUnauthenticated;
  const hasPendingAgreements = user?.pending_agreements
    ? user.pending_agreements.length > 0
    : false;
  const needsReset = user?.password_reset_code;
  let redirectTo = null;

  if (isAuthorized) {
    switch (location.pathname) {
      case '/reset-password':
        if (!needsReset) redirectTo = '/';
        break;
      case '/agreements':
        if (!hasPendingAgreements) redirectTo = '/';
        break;
      default:
        if (needsReset) redirectTo = '/reset-password';
        if (hasPendingAgreements) redirectTo = '/agreements';
        break;
    }
  } else {
    redirectTo = '/';
  }

  if (user?.state === ShipperState.Disabled) {
    return <DisabledScreen />;
  } else {
    return redirectTo ? (
      <Navigate to={redirectTo} state={{ from: location }} replace />
    ) : (
      children
    );
  }
}
