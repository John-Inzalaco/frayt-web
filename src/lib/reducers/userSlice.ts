import { createSlice, isPending, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '.';
import * as UserAction from '../actions/UserAction';
import {
  User,
  AgreementData,
  CreditCardData,
  LoginData,
  CreditCardResponseData,
  AgreementsResponseData,
  UserResponseData,
  UserData,
  NewUserData,
  AuthUserResponseData,
  LogoutResponseData,
  InteractedDriversResponseData,
} from '../actions/UserAction';
import {
  createAxiosThunk,
  getActionErrorMessage,
  ThunkStatus,
} from '../AxiosThunk';
import { isReducerAction } from './helpers';
import { Driver } from '../actions/MatchAction';

export type AuthStatus = 'failed' | 'succeeded' | 'pending';

export type ValidFlags = 'preferred_driver';

export type FeatureFlag = {
  preferred_driver: boolean;
};

export type UserState = {
  user: null | User;
  creditCard?: null | string;
  status: ThunkStatus;
  authStatus: AuthStatus;
  errors: null | string;
  featureFlags: FeatureFlag;
  interactedDrivers: Driver[];
};

const initialState: UserState = {
  user: null,
  errors: null,
  creditCard: undefined,
  status: 'loading',
  authStatus: 'pending',
  featureFlags: {
    preferred_driver: false,
  },
  interactedDrivers: [],
};

export const updateOneSignalID = createAxiosThunk<UserResponseData>(
  'user/updateOneSignalID',
  UserAction.updateOneSignalID
);

export const fetchUser = createAxiosThunk<UserResponseData>(
  'user/fetchUser',
  UserAction.getUser
);

export const updateUser = createAxiosThunk<UserResponseData, UserData>(
  'user/updateUser',
  UserAction.updateUser
);

export const registerUser = createAxiosThunk<
  AuthUserResponseData,
  Partial<NewUserData>
>('user/registerUser', UserAction.registerUser);

export const loginUser = createAxiosThunk<AuthUserResponseData, LoginData>(
  'user/loginUser',
  UserAction.loginUser
);

export const updateUserAgreements = createAxiosThunk<
  AgreementsResponseData,
  AgreementData[]
>('user/updateUserAgreements', UserAction.updateUserAgreements);

export const fetchCreditCard = createAxiosThunk<CreditCardResponseData>(
  'user/fetchCreditCard',
  UserAction.getCreditCard
);

export const updateCreditCard = createAxiosThunk<
  CreditCardResponseData,
  CreditCardData
>('user/updateCreditCard', UserAction.updateCreditCard);

export const logoutUser = createAxiosThunk<LogoutResponseData>(
  'user/logoutUser',
  UserAction.logoutUser
);

export const fetchFeatureFlag = createAxiosThunk<
  UserAction.FeatureFlagResponseData,
  { flag: ValidFlags }
>('user/featureFlags', UserAction.getFeatureFlag);

export const fetchInteractedDrivers =
  createAxiosThunk<InteractedDriversResponseData>(
    'user/fetchInteractedDrivers',
    UserAction.getInteractedDrivers
  );

const userSuccess = (
  state: UserState,
  action: PayloadAction<UserResponseData | AuthUserResponseData, string>
) => {
  const response = action.payload.response;
  state.user = 'shipper' in response ? response.shipper : response;
  state.status = 'succeeded';
  state.authStatus = 'succeeded';
  state.errors = null;
};

const userFailure = (state: UserState) => {
  state.user = null;
  state.status = 'failed';
  state.authStatus = 'failed';
  state.creditCard = null;
};

const authFailure = (
  state: UserState,
  action: PayloadAction<unknown, string>
) => {
  userFailure(state);
  state.errors = getActionErrorMessage(action);
};

const reducerName = 'user';

const isUserPending = (action: PayloadAction<unknown>) =>
  isReducerAction(reducerName)(action) && isPending(action);

const userSlice = createSlice({
  name: reducerName,
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(registerUser.rejected, authFailure)
      .addCase(loginUser.rejected, authFailure)
      .addCase(fetchUser.rejected, userFailure)
      .addCase(logoutUser.fulfilled, userFailure)
      .addCase(logoutUser.rejected, userFailure)
      .addCase(updateUser.fulfilled, userSuccess)
      .addCase(updateOneSignalID.fulfilled, userSuccess)
      .addCase(registerUser.fulfilled, userSuccess)
      .addCase(loginUser.fulfilled, userSuccess)
      .addCase(fetchUser.fulfilled, userSuccess)
      .addCase(updateUserAgreements.fulfilled, (state, action) => {
        state.user = state.user && {
          ...state.user,
          pending_agreements: action.payload.agreement_documents,
        };
      })
      .addCase(fetchCreditCard.fulfilled, (state, action) => {
        state.creditCard = action.payload.response?.credit_card || null;
      })
      .addCase(fetchCreditCard.rejected, state => {
        state.creditCard = null;
      })
      .addCase(updateCreditCard.fulfilled, (state, action) => {
        state.creditCard = action.payload.response?.credit_card || null;
      })
      .addCase(fetchFeatureFlag.fulfilled, (state, action) => {
        const key = action.meta.arg.flag as ValidFlags;
        const value = action.payload.enabled;
        state.featureFlags[key] = !!value;
      })
      .addCase(fetchInteractedDrivers.fulfilled, (state, action) => {
        state.interactedDrivers = action.payload.data;
      })
      .addCase(fetchInteractedDrivers.rejected, state => {
        state.interactedDrivers = [];
      })
      .addMatcher(isUserPending, state => {
        state.status = 'loading';
      });
  },
});

export default userSlice.reducer;

export const selectUser = (state: RootState) => state.user.user;
export const selectUserStatus = (state: RootState) => state.user.status;
export const selectUserErrors = (state: RootState) => state.user.errors;
export const selectAuthStatus = (state: RootState) => state.user.authStatus;
export const selectCreditCard = (state: RootState) => state.user.creditCard;
