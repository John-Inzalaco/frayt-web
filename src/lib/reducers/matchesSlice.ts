import { createSlice, isFulfilled, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '.';
import * as MatchAction from '../actions/MatchAction';
import {
  Match,
  MatchFilters,
  MatchResponseData,
  MatchesResponseData,
  AuthorizedMatchData,
  DriverLocation,
} from '../actions/MatchAction';
import { createAxiosThunk, ThunkStatus } from '../AxiosThunk';
import { isObject, removeDuplicates, shallowEqual } from '../Utility';
import { authorizeEstimate } from './estimateSlice';
import { haveDirectionsChanged } from './helpers';

export type MatchesState = {
  results: Match[];
  status: ThunkStatus;
  error?: null | string;
  page_count: number;
  filters: MatchFilters;
};

const initialState: MatchesState = {
  results: [],
  status: 'idle',
  error: null,
  page_count: 1,
  filters: {
    per_page: 10,
    page: 0,
  },
};

export const fetchMatches = createAxiosThunk<MatchesResponseData, MatchFilters>(
  'matches/fetchMatches',
  MatchAction.getMatches
);

export const updateMatch = createAxiosThunk<
  MatchResponseData,
  [string, AuthorizedMatchData]
>('matches/updateMatch', ([matchId, data]) =>
  MatchAction.updateMatch(matchId, data)
);

export const fetchMatch = createAxiosThunk<MatchResponseData, string>(
  'matches/fetchMatch',
  MatchAction.getMatch
);

export const cancelMatch = createAxiosThunk<
  MatchResponseData,
  [string, string]
>('matches/cancelMatch', ([matchId, reason]) =>
  MatchAction.cancelMatch(matchId, reason)
);

export function isMatchResponseDataAction(
  action: PayloadAction<unknown, string>
): action is PayloadAction<MatchResponseData, string> {
  if (isFulfilled(action)) {
    if (isObject(action.payload, ['response'])) {
      return MatchAction.isMatch(action.payload.response);
    }
  }

  return false;
}

const matchSuccess = (
  state: MatchesState,
  action: PayloadAction<MatchResponseData, string>
) => {
  const match = action.payload.response;

  if (state.results.find(m => m.id === match.id)) {
    state.results = state.results.map(m => (m.id === match.id ? match : m));
  } else {
    state.results.push(match);
  }
};

const matchesSlice = createSlice({
  name: 'matches',
  initialState,
  reducers: {
    setCurrentLocation: (
      state,
      {
        payload: [matchId, driverLocation],
      }: PayloadAction<[string | undefined, DriverLocation]>
    ) => {
      state.results.map(m => {
        if (m.id === matchId && m.driver) {
          m.driver.current_location = driverLocation;

          return {
            ...m,
            driver: { ...m.driver, current_location: driverLocation },
          };
        } else {
          return m;
        }
      });
    },
    updateMatchState: (state, action: PayloadAction<Match>) => {
      state.results = state.results.map(prevMatch => {
        const newMatch = action.payload;

        if (haveDirectionsChanged(prevMatch, newMatch)) return { ...newMatch };

        if (prevMatch.driver !== newMatch.driver) return { ...newMatch };

        return prevMatch;
      });
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchMatches.pending, (state, action) => {
        const newFilters = action.meta.arg;
        state.status = 'loading';

        if (newFilters) {
          const changed = !shallowEqual(state.filters, newFilters);

          if (changed) {
            if (state.filters.page === newFilters.page) {
              state.results = [];
            }
            state.filters = newFilters;
          }
        }
      })
      .addCase(fetchMatches.fulfilled, (state, action) => {
        const results = state.results.concat(action.payload.response);
        state.status = 'succeeded';
        state.results = removeDuplicates(results, m => m.id);
        state.page_count = action.payload.page_count;
      })
      .addCase(fetchMatches.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(updateMatch.fulfilled, matchSuccess)
      .addCase(authorizeEstimate.fulfilled, matchSuccess)
      .addCase(cancelMatch.fulfilled, matchSuccess)
      .addCase(fetchMatch.fulfilled, matchSuccess);
  },
});

export const { setCurrentLocation, updateMatchState } = matchesSlice.actions;

export default matchesSlice.reducer;

export const selectAllMatches = (state: RootState, exclude: string[] = []) =>
  state.matches.results.filter(({ id }) => !exclude.includes(id));

export const selectMatchById = (state: RootState, matchId?: string) =>
  state.matches.results.find(match => match.id === matchId);

export const selectMatchesStatus = (state: RootState) => state.matches.status;

export const selectHasMoreMatches = (state: RootState) =>
  state.matches.page_count > (state.matches.filters.page || 0);

export const selectMatchesPageCount = (state: RootState) =>
  state.matches.page_count;

export const selectMatchesFilters = (state: RootState) => state.matches.filters;
