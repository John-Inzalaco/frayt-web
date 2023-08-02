import { Icon, MaybeElement, Tab, Tabs } from '@blueprintjs/core';
import { BlueprintIcons_16Id } from '@blueprintjs/icons/lib/esm/generated/16px/blueprint-icons-16';
import { Grid, Row } from 'react-flexbox-grid';
import { useSelector } from 'react-redux';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { selectUser } from '../lib/reducers/userSlice';

import Account from './settings/Account';
import UserManagement from './settings/UserManagement';

type SettingsPanel = {
  title: string;
  path: string;
  icon: BlueprintIcons_16Id | MaybeElement;
  key: string;
  component: () => JSX.Element | null;
};

export default function SettingsScreen() {
  const navigate = useNavigate();
  const { panel: panelKey } = useParams();
  const user = useSelector(selectUser);

  if (!user) return null;

  const panels: SettingsPanel[] = [
    {
      title: 'My Account',
      path: '/settings/account',
      icon: 'user',
      key: 'account',
      component: Account,
    },
  ];

  if (['location_admin', 'company_admin'].includes(user.role) && user.location)
    panels.push({
      title: 'User Management',
      path: '/settings/users',
      icon: 'people',
      key: 'users',
      component: UserManagement,
    });
  const findPanel = (key?: string) => panels.find(p => p.key === key);

  const changePanel = (key: string) => {
    const panel = findPanel(key);

    if (panel) {
      return navigate(panel.path);
    }
  };

  const panel = findPanel(panelKey);

  if (!panel) {
    return <Navigate to={'/settings'} />;
  }

  return (
    <div className='appContent'>
      <Grid>
        <Row className='appCushion'></Row>
        <Tabs
          id='settings'
          selectedTabId={panel.key}
          onChange={changePanel}
          renderActiveTabPanelOnly
          large
        >
          {panels.map(panel => (
            <Tab
              id={panel.key}
              key={panel.key}
              title={
                <span>
                  {panel.title} {panel.icon && <Icon icon={panel.icon} />}
                </span>
              }
              panel={<panel.component />}
            />
          ))}
        </Tabs>
      </Grid>
    </div>
  );
}
