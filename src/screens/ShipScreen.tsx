import { useCallback, useEffect, useMemo, useState } from 'react';
import { Tab, Tabs } from '@blueprintjs/core';
import { Grid, Row, Col } from 'react-flexbox-grid';
import Estimate from '../components/estimate/steps/Estimate';
import Cargo from '../components/estimate/steps/Cargo';
import Delivery from '../components/estimate/steps/Delivery';
import Payment from '../components/estimate/steps/Payment';
import Review from '../components/estimate/steps/Review';
import AccountInfoWarning from '../components/user/AccountInfoWarning';
import { useSelector } from 'react-redux';
import {
  fetchEstimate,
  resetEstimate,
  selectEstimate,
} from '../lib/reducers/estimateSlice';
import { useAppDispatch } from '../lib/store';
import { useNavigate, useParams } from 'react-router-dom';
import { isMessageError } from '../lib/FraytRequest';
import Summaries from '../components/estimate/summary/Summaries';

export enum ShipTabKey {
  Estimate = 'estimate',
  Cargo = 'cargo',
  Delivery = 'delivery',
  Payment = 'payment',
  Review = 'review',
}

type ShipTabs = {
  title: string;
  key: ShipTabKey;
  component: (props: ShipTabProps) => JSX.Element | null;
};

export type ChangeTabFunc = (position: ShipTabKey | number) => void;

export type ShipTabProps = {
  changeTab: ChangeTabFunc;
  showSideBar: boolean;
};

export default function ShipScreen() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const params = useParams();
  const [estimateKey, setEstimateKey] = useState<string>(
    params.estimateID || 'new'
  );
  const [selectedTab, setSelectedTab] = useState<ShipTabKey>(
    ShipTabKey.Estimate
  );

  const [touchedTabs, setTouchedTabs] = useState<ShipTabKey[]>([
    ShipTabKey.Estimate,
  ]);

  const match = useSelector(selectEstimate);

  const tabs = useMemo(() => {
    const tabs: ShipTabs[] = [
      {
        key: ShipTabKey.Estimate,
        title: 'Estimate',
        component: Estimate,
      },
    ];

    if (!match || match.stops.length === 1) {
      tabs.push({
        key: ShipTabKey.Cargo,
        title: 'Cargo',
        component: Cargo,
      });
    }

    tabs.push({
      key: ShipTabKey.Delivery,
      title: 'Delivery',
      component: Delivery,
    });

    tabs.push({
      key: ShipTabKey.Payment,
      title: 'Payment',
      component: Payment,
    });

    tabs.push({
      key: ShipTabKey.Review,
      title: 'Review',
      component: Review,
    });

    return tabs;
  }, [match]);

  const isTouched = useCallback(
    (tabKey: ShipTabKey) => touchedTabs.includes(tabKey),
    [touchedTabs]
  );

  const changeTab: ChangeTabFunc = useCallback(
    position => {
      const index =
        typeof position === 'number'
          ? tabs.findIndex(tab => tab.key === selectedTab) + position
          : tabs.findIndex(tab => tab.key === position);

      const tabKey = tabs[index].key;

      if (index <= touchedTabs.length) {
        if (!isTouched(tabKey)) setTouchedTabs(touchedTabs.concat(tabKey));
        setSelectedTab(tabKey);
      }
    },
    [isTouched, selectedTab, touchedTabs, tabs]
  );

  const resetScreen = useCallback(() => {
    setTouchedTabs([ShipTabKey.Estimate]);
    setSelectedTab(ShipTabKey.Estimate);
    dispatch(resetEstimate());
    setEstimateKey('new');
  }, [dispatch]);

  const showSideBar =
    touchedTabs.length > 1 && selectedTab !== ShipTabKey.Review;

  useEffect(() => {
    if (!match && params.estimateID) {
      dispatch(fetchEstimate(params.estimateID))
        .unwrap()
        .then(({ response }) => {
          if (response.state === 'pending') {
            setEstimateKey(response.id);
          } else {
            navigate('/matches/' + response.id, { replace: true });
          }
        })
        .catch((e: unknown) => {
          if (isMessageError(e) && e.code === 'not_found') {
            navigate('/ship', { replace: true });
          } else {
            navigate('/ship', { replace: false });
          }
        });
    } else if (match) {
      if (match.state === 'pending') {
        if (!params.estimateID) {
          navigate(`/ship/${match.id}`, { replace: true });
        }
      } else {
        resetScreen();
      }
    }
  }, [dispatch, navigate, resetScreen, params, match]);

  return (
    <div className='appContent' key={estimateKey}>
      <Grid>
        <Row className='appCushion'>
          {/* We can display callouts here in the future if needed */}
        </Row>
        <Row>
          <Col xs={12} md={12}>
            <h1 className='pageTitle'>Ship</h1>
          </Col>
        </Row>

        <Row>
          <AccountInfoWarning />
        </Row>

        <Row>
          <Col xs={12} lg={showSideBar ? 8 : 12} className='shipTab'>
            <Tabs
              id='ship_tabs'
              selectedTabId={selectedTab}
              onChange={changeTab}
              renderActiveTabPanelOnly
              large
            >
              {tabs.map((tab, index) => (
                <Tab
                  id={tab.key}
                  key={tab.key}
                  title={
                    <div>
                      <span>{index + 1}</span>
                      <span> {tab.title}</span>
                    </div>
                  }
                  disabled={!isTouched(tab.key)}
                  panel={
                    <tab.component
                      showSideBar={showSideBar}
                      changeTab={changeTab}
                    />
                  }
                  className={isTouched(tab.key) ? 'touched' : ''}
                />
              ))}
            </Tabs>
          </Col>
          {showSideBar && (
            <Col xs={4} className='u-display__none u-display__block--lg'>
              <Summaries
                match={match}
                touched={touchedTabs}
                changeTab={changeTab}
              />
            </Col>
          )}
        </Row>
      </Grid>
    </div>
  );
}
