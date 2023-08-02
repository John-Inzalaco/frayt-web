import { AnyAction, Reducer } from '@reduxjs/toolkit';
import matchesReducer, { MatchesState } from './matchesSlice';
import shippersReducer, { ShippersState } from './shippersSlice';
import userReducer, { UserState } from './userSlice';
import estimateReducer, { EstimateState } from './estimateSlice';

export type RootState = {
  shippers: ShippersState;
  user: UserState;
  matches: MatchesState;
  estimate: EstimateState;
};

type StateKey = keyof RootState;

export type RootReducer = {
  [key in StateKey]: Reducer<RootState[key], AnyAction>;
};

const rootReducer: RootReducer = {
  shippers: shippersReducer,
  user: userReducer,
  matches: matchesReducer,
  estimate: estimateReducer,
};

export default rootReducer;
