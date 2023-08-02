import decode from 'jwt-decode';
import Intercom from './Intercom';

export function isTokenExpired(expires: number | null) {
  if (expires) {
    // divide by 1000 to adjust for milliseconds
    const expiration = Date.now() / 1000;
    return expires < expiration;
  } else {
    return true;
  }
}

export function unsetToken() {
  localStorage.removeItem('id_token');
  localStorage.removeItem('user_id');
  localStorage.removeItem('expires');
  Intercom('shutdown');
}

export function getToken() {
  // Retrieves the user token from localStorage
  return localStorage.getItem('id_token');
}

export function getUserID() {
  // Retrieves the user ID from localStorage
  return localStorage.getItem('user_id');
}

export function getExpires() {
  const expires = localStorage.getItem('expires');
  return expires ? parseInt(expires) : null;
}

type decodedToken = {
  sub: string;
  exp: number;
};

export function setToken(idToken: string) {
  // Saves user token to localStorage
  localStorage.setItem('id_token', idToken);
  const decodedToken = decode<decodedToken>(idToken);
  localStorage.setItem('user_id', decodedToken.sub);
  localStorage.setItem('expires', decodedToken.exp.toString());
}
