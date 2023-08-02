import {
  AsyncThunk,
  AsyncThunkAction,
  AsyncThunkPayloadCreator,
  createAsyncThunk,
  isRejected,
  PayloadAction,
} from '@reduxjs/toolkit';
import { AxiosResponse } from 'axios';
import { getErrorMessage } from './FraytRequest';
import { RootState } from './reducers';
import { isObject } from './Utility';

export type AxiosThunkAPIConfig = {
  state: RootState;
};

export type AxiosThunkPayloadCreator<
  Returned = unknown,
  Args = void
> = AsyncThunkPayloadCreator<Returned, Args, AxiosThunkAPIConfig>;

export type AxiosThunk<Returned = unknown, Args = void> = AsyncThunk<
  Returned,
  Args,
  AxiosThunkAPIConfig
>;

export type AxiosThunkAction<
  Returned = unknown,
  Args = void
> = AsyncThunkAction<Returned, Args, AxiosThunkAPIConfig>;

export function getActionErrorMessage(action: PayloadAction<unknown, string>) {
  const error = isRejected(action) ? action.payload || action.error : null;

  return getErrorMessage(error);
}

export function createAxiosThunk<Returned, Args = void>(
  typePrefix: string,
  payloadCreator: AxiosThunkPayloadCreator<
    Promise<AxiosResponse<Returned, Args>>,
    Args
  >
): AxiosThunk<Returned, Args> {
  return createAsyncThunk<Returned, Args>(
    typePrefix,
    async (args: Args, thunkAPI) => {
      try {
        const response = await payloadCreator(args, thunkAPI);

        return 'data' in response ? response.data : response;
      } catch (e) {
        if (isObject(e, ['response']) && isObject(e.response, ['data'])) {
          return thunkAPI.rejectWithValue(e.response.data);
        } else {
          throw e;
        }
      }
    }
  );
}

export type ThunkStatus = 'idle' | 'failed' | 'loading' | 'succeeded';
