import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import HomeScreen from '../screens/HomeScreen';
import ShipScreen from '../screens/ShipScreen';
import MatchesScreen from '../screens/MatchesScreen';
import MatchScreen from '../screens/MatchScreen';
import Settings from '../screens/SettingsScreen';
import SupportScreen from '../screens/SupportScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import AgreementScreen from '../screens/AgreementsScreen';
import NotFoundScreen from '../screens/NotFoundScreen';
import RequireAuth from './RequireAuth';
import { useSelector } from 'react-redux';
import { selectAuthStatus } from '../lib/reducers/userSlice';
import React from 'react';
import LoadingScreen from '../screens/LoadingScreen';

type AppRouterProps = {
  headerElement: React.ReactNode;
};

export default function AppRouter({ headerElement }: AppRouterProps) {
  const authStatus = useSelector(selectAuthStatus);

  return (
    <BrowserRouter>
      <div>
        {headerElement}
        {authStatus === 'pending' ? (
          <LoadingScreen />
        ) : (
          <Routes>
            <Route path='*' element={<NotFoundScreen />} />
            <Route path='/' element={<HomeScreen />} />
            <Route path='/register' element={<Navigate to='/' replace />} />

            <Route path='/forgot-password' element={<ForgotPasswordScreen />} />

            <Route
              path='/reset-password'
              element={
                <RequireAuth>
                  <ResetPasswordScreen />
                </RequireAuth>
              }
            />

            <Route path='/support' element={<SupportScreen />} />

            <Route path='/welcome' element={<WelcomeScreen />} />

            <Route
              path='/ship'
              element={
                <RequireAuth showUnauthenticated>
                  <ShipScreen />
                </RequireAuth>
              }
            >
              <Route
                path=':estimateID'
                element={
                  <RequireAuth showUnauthenticated>
                    <ShipScreen />
                  </RequireAuth>
                }
              />
            </Route>
            <Route
              path='/matches'
              element={
                <RequireAuth>
                  <MatchesScreen />
                </RequireAuth>
              }
            />
            <Route
              path='/matches/:matchID'
              element={
                <RequireAuth>
                  <MatchScreen />
                </RequireAuth>
              }
            />
            <Route
              path='/settings/:panel'
              element={
                <RequireAuth>
                  <Settings />
                </RequireAuth>
              }
            />
            <Route
              path='/settings'
              element={<Navigate to='/settings/account' replace />}
            />
            <Route
              path='/agreements'
              element={
                <RequireAuth>
                  <AgreementScreen />
                </RequireAuth>
              }
            />
          </Routes>
        )}
      </div>
    </BrowserRouter>
  );
}
