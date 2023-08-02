import { selectUser } from '../../lib/reducers/userSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBolt } from '@fortawesome/pro-solid-svg-icons';
import { ShipperState } from '../../lib/actions/ShipperAction';
import { Callout, Icon, Intent } from '@blueprintjs/core';
import { Link } from 'react-router-dom';
import { User } from '../../lib/actions/UserAction';
import { useSelector } from 'react-redux';
import { Col } from 'react-flexbox-grid';

export default function AccountInfoWarning() {
  const user = useSelector(selectUser);
  const properties: (keyof User)[] = [
    'address',
    'phone',
    'first_name',
    'last_name',
  ];

  const userDisabled = user?.state !== ShipperState.Approved;
  const profileIncomplete =
    !!user && properties.some(property => !user[property]);

  return (
    <>
      {userDisabled && (
        <Col xs={12} md={12}>
          <div className='warningbar'>
            <div className='warningheader'>
              <span className='u-push__left--lg'>
                <FontAwesomeIcon icon={faBolt} />
              </span>
              <span className='u-push__left--xs'> Awaiting approval </span>
            </div>
            <div className='warningcontent'>
              <p className='u-push__left--lg'>
                You can take a look around while you wait for your account to be
                approved. <br /> You can expect approval within 2 business days.
                If you have an urgent need, please contact the sales staff to
                expedite the process.
              </p>
            </div>
          </div>
        </Col>
      )}
      {profileIncomplete && !userDisabled && (
        <Callout title='Incomplete Profile' intent={Intent.WARNING}>
          We highly recommend that you fill out all of your account information
          to speed up the process.
          <Link to='/settings/account' className='calloutLink'>
            FINISH PROFILE
            <Icon icon='chevron-right' />
          </Link>
        </Callout>
      )}
    </>
  );
}
