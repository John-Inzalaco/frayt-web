import {
  createSlice,
  isFulfilled,
  isPending,
  isRejected,
  PayloadAction,
} from '@reduxjs/toolkit';
import { RootState } from '.';
import { Match } from '../actions/MatchAction';
import * as MatchAction from '../actions/MatchAction';
import {
  MatchResponseData,
  MatchData,
  NewMatchData,
} from '../actions/MatchAction';
import { createAxiosThunk, ThunkStatus } from '../AxiosThunk';
import { getErrorMessage } from '../FraytRequest';
import { isMatchResponseDataAction } from './matchesSlice';
import { isReducerAction } from './helpers';

export type EstimateState = {
  match: null | Match;
  status: ThunkStatus;
  errors: null | string;
  boxTruckAgreement: boolean;
};

const initialState: EstimateState = {
  match: null,
  status: 'idle',
  errors: null,
  boxTruckAgreement: false,
};

export const createEstimate = createAxiosThunk<MatchResponseData, NewMatchData>(
  'estimate/createEstimate',
  MatchAction.createMatch
);

export const duplicateMatch = createAxiosThunk<
  MatchResponseData,
  [string, MatchData]
>('estimate/duplicateMatch', ([matchId, data]) =>
  MatchAction.duplicateMatch(matchId, data)
);

export const updateEstimate = createAxiosThunk<
  MatchResponseData,
  [string, MatchData]
>('estimate/updateEstimate', ([matchId, data]) =>
  MatchAction.updateMatch(matchId, data)
);

export const authorizeEstimate = createAxiosThunk<MatchResponseData, string>(
  'estimate/authorizeEstimate',
  MatchAction.authorizeMatch
);

export const fetchEstimate = createAxiosThunk<MatchResponseData, string>(
  'estimate/fetchEstimate',
  MatchAction.getMatch
);

const reset = (state: EstimateState) => {
  state.boxTruckAgreement = false;
  state.status = 'idle';
  state.errors = null;
  state.match = null;
};

const reducerName = 'estimate';

const isEstimatePending = (action: PayloadAction<unknown>) =>
  isReducerAction(reducerName)(action) && isPending(action);

const isEstimateRejected = (action: PayloadAction<unknown>) =>
  isReducerAction(reducerName)(action) && isRejected(action);

const isEstimateSuccess = (action: PayloadAction<unknown>) =>
  isReducerAction(reducerName)(action) &&
  isFulfilled(action) &&
  isMatchResponseDataAction(action) &&
  !action.type.endsWith('authorizeEstimate');

const estimateSlice = createSlice({
  name: reducerName,
  initialState,
  reducers: {
    resetEstimate: reset,
    setBoxTruckAgreement: (state, action: PayloadAction<boolean>) => {
      state.boxTruckAgreement = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(authorizeEstimate.fulfilled, reset)
      .addMatcher(isEstimatePending, state => {
        state.status = 'loading';
      })
      .addMatcher(isEstimateRejected, (state, action) => {
        state.status = 'failed';
        state.errors = getErrorMessage(action.payload);
      })
      .addMatcher(
        isEstimateSuccess,
        (
          state: EstimateState,
          action: PayloadAction<MatchResponseData, string>
        ) => {
          state.errors = null;
          state.status = 'succeeded';
          state.match = action.payload.response;
        }
      );
  },
});

export default estimateSlice.reducer;

export const { resetEstimate, setBoxTruckAgreement } = estimateSlice.actions;

export const selectEstimate = (state: RootState) => state.estimate.match;
export const selectEstimateStatus = (state: RootState) => state.estimate.status;
export const selectEstimateErrors = (state: RootState) => state.estimate.errors;
export const selectEstimateBoxTruckAgreement = (state: RootState) =>
  state.estimate.boxTruckAgreement;
