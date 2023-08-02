import { Action, configureStore, ThunkDispatch } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import rootReducer, { RootState } from './reducers';
import { TypedUseSelectorHook } from 'react-redux';
import { useSelector } from 'react-redux';

const store = configureStore<RootState>({
  reducer: rootReducer,
});

export default store;

export type AppDispatch = ThunkDispatch<RootState, void, Action>;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
