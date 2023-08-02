import { AxiosError, AxiosRequestHeaders } from 'axios';
import * as Auth from './AuthService';

export function buildHeaders(
  headers: AxiosRequestHeaders = {},
  authorized = true
) {
  headers['Content-Type'] = 'application/json';

  if (authorized) {
    const token = Auth.getToken();

    if (token) {
      headers.Authorization = 'Bearer ' + token;
    }
  }

  return headers;
}

export function buildUrl(path?: string) {
  return `${process.env.REACT_APP_FRAYT_API}${path}`;
}

function isUnknownResponseError(error: unknown): error is UnknownResponse {
  return typeof error === 'object' && error !== null && 'response' in error;
}

export function isMessageError(error: unknown): error is MessageError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'code' in error
  );
}

export function isGenericError(error: unknown): error is Error {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'name' in error
  );
}

export function isAPIError(error: unknown): error is APIError {
  if (isUnknownResponseError(error)) {
    return isMessageError(error.response?.data);
  }

  return false;
}

export function getErrorMessage(error: unknown) {
  let message: string | undefined;

  if (isAPIError(error)) {
    message = error.response?.data.message;
  } else if (
    isUnknownResponseError(error) ||
    isMessageError(error) ||
    isGenericError(error)
  ) {
    message = error.message;
  }

  return message || 'Failed to connect to server';
}

export type ActionError = APIError | Error;

export type APIError = AxiosError<MessageError>;

export type MessageError = {
  message: string;
  code: string;
};

type UnknownResponse = AxiosError<unknown, unknown>;
