import { useAppDispatch } from '../lib/store';
import { useSelector } from 'react-redux';
import {
  fetchUser,
  selectAuthStatus,
  selectUser,
} from '../lib/reducers/userSlice';
import Intercom from '../lib/Intercom';
import { useEffect } from 'react';

function setGoNativeTabs(enabled: boolean) {
  if (navigator.userAgent.indexOf('gonative') > -1) {
    const tabs = {
      enabled: enabled,
      items: [
        {
          icon: 'fa-bolt',
          label: 'Ship',
          url: 'https://www.frayt.app/ship',
        },
        {
          icon: 'fa-adjust',
          label: 'Matches',
          url: 'https://www.frayt.app/matches',
        },
        {
          icon: 'fa-cog',
          label: 'Settings',
          url: 'https://www.frayt.app/settings',
        },
        {
          icon: 'fa-life-ring',
          label: 'Support',
          url: 'https://www.frayt.app/support',
        },
      ],
    };
    const json = JSON.stringify(tabs);
    window.location.href =
      'gonative://tabs/setTabs?tabs=' + encodeURIComponent(json);
  }
}

export default function OverlayNavigation() {
  const dispatch = useAppDispatch();
  const user = useSelector(selectUser);
  const authStatus = useSelector(selectAuthStatus);
  useEffect(() => {
    dispatch(fetchUser());

    Intercom('boot', {
      app_id: 'pacfxq61',
      contact_type: 'shipper',
    });

    // Hide the loader
    setTimeout(() => {
      const loader = document.getElementById('loader');
      if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => (loader.style.display = 'none'), 500);
      }
    }, 1);
  }, [dispatch]);

  useEffect(() => {
    if (authStatus === 'succeeded' && user) {
      Intercom('update', {
        user_id: user.id,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        phone: user.phone,
      });
    }

    setGoNativeTabs(authStatus === 'succeeded');
  }, [authStatus, user]);

  return null;
}
