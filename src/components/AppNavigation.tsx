import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Navbar, Button, Icon } from '@blueprintjs/core';
import { Grid } from 'react-flexbox-grid';
import { useSelector } from 'react-redux';
import { logoutUser, selectAuthStatus } from '../lib/reducers/userSlice';
import { useAppDispatch } from '../lib/store';

export default function AppNavigation() {
  const dispatch = useAppDispatch();
  const authStatus = useSelector(selectAuthStatus);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const authenticated = authStatus === 'succeeded';

  const toggleMenu = () => setShowMobileMenu(!showMobileMenu);
  const logout = () => dispatch(logoutUser());

  let rightNav = <div />;
  let mobileMenu = <div />;

  const links = authenticated ? (
    <>
      <NavLink to='/ship'>
        <Button className='bp4-minimal navButton' icon='offline' text='Ship' />
      </NavLink>
      <NavLink to='/matches'>
        <Button
          className='bp4-minimal navButton'
          icon='properties'
          text='Matches'
        />
      </NavLink>
      <NavLink to='/settings'>
        <Button className='bp4-minimal navButton' icon='cog' text='Settings' />
      </NavLink>
    </>
  ) : null;

  const leftNav = (
    <div>
      <div
        onClick={toggleMenu}
        className={
          showMobileMenu
            ? 'mobile-menu-toggle mobile-menu-toggle-hide'
            : 'mobile-menu-toggle'
        }
      >
        <Button className='bp4-minimal navButton' icon='menu' />
      </div>
      <div className='desktop-menu'>
        {links}
        <NavLink to='/support'>
          <Button
            className='bp4-minimal navButton'
            icon='pulse'
            text='Support'
          />
        </NavLink>
      </div>
    </div>
  );

  mobileMenu = (
    <div
      className={
        showMobileMenu ? 'mobile-menu mobile-menu-show' : 'mobile-menu'
      }
    >
      <div className='mobile-menu-fade'>
        <div className='mobile-menu-link-wrapper'>
          <Icon
            className='bp4-minimal navButton mobile-menu-close'
            icon='cross'
            iconSize={20}
            onClick={toggleMenu}
          />
          {links}
          <NavLink to='/support'>
            <Button
              className='bp4-minimal navButton'
              icon='pulse'
              text='Support'
              onClick={toggleMenu}
            />
          </NavLink>
          {authenticated ? (
            <Button
              className='bp4-minimal navButton'
              icon='lock'
              text='Logout'
              onClick={logout}
            />
          ) : (
            <NavLink to='/'>
              <Button
                className='bp4-minimal navButton'
                icon='cog'
                text='Sign Up'
              />
            </NavLink>
          )}
        </div>
      </div>
    </div>
  );

  if (authenticated) {
    rightNav = (
      <div onClick={logout}>
        <Button
          className='bp4-minimal navButton desktop-logout'
          icon='lock'
          text='Logout'
        />
      </div>
    );
  } else {
    rightNav = (
      <NavLink to='/'>
        <Button
          className='bp4-minimal navButton desktop-logout'
          icon='cog'
          text='Sign Up'
        />
      </NavLink>
    );
  }

  return (
    <Navbar>
      {authStatus !== 'pending' && mobileMenu}
      <Grid>
        <Navbar.Group>
          <Link to='/'>
            <Navbar.Heading>
              <img
                src='/img/logo-white.png'
                alt='Frayt'
                style={{ height: 52, paddingTop: 4 }}
              />
            </Navbar.Heading>
          </Link>
        </Navbar.Group>
        <Navbar.Group align='right'>
          {authStatus !== 'pending' && (
            <>
              {leftNav}
              {rightNav}
            </>
          )}
        </Navbar.Group>
      </Grid>
    </Navbar>
  );
}
