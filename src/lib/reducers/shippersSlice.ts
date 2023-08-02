import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '.';
import * as ShipperAction from '../actions/ShipperAction';
import {
  ShippersFilters,
  Shipper,
  ShipperData,
  ShippersResponseData,
  ShipperResponseData,
} from '../actions/ShipperAction';
import { createAxiosThunk, ThunkStatus } from '../AxiosThunk';
import { shallowEqual } from '../Utility';

export type ShippersState = {
  results: Shipper[];
  status: ThunkStatus;
  error?: null | string;
  page_count: number;
  filters: ShippersFilters;
};

const initialState: ShippersState = {
  results: [],
  status: 'idle',
  error: null,
  page_count: 1,
  filters: {},
};

export const fetchShippers = createAxiosThunk<
  ShippersResponseData,
  ShippersFilters
>('shippers/fetchShippers', ShipperAction.fetchShippers);

export const updateShipper = createAxiosThunk<
  ShipperResponseData,
  [string, Partial<ShipperData>]
>('shippers/updateShipper', async ([shipper_id, data]) =>
  ShipperAction.updateShipper(shipper_id, data)
);

export const createShipper = createAxiosThunk<
  ShipperResponseData,
  Partial<ShipperData>
>('shippers/createShipper', ShipperAction.createShipper);

const shippersSlice = createSlice({
  name: 'shippers',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchShippers.pending, (state, action) => {
        const newFilters = action.meta.arg;
        state.status = 'loading';

        const changed = !shallowEqual(state.filters, newFilters);

        if (changed) {
          state.filters = newFilters;

          if (state.filters.cursor === newFilters.cursor) {
            state.results = [];
          }
        }
      })
      .addCase(fetchShippers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.results = state.results.concat(action.payload.data);
        state.page_count = action.payload.page_count;
      })
      .addCase(fetchShippers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(updateShipper.fulfilled, (state, { payload: { response } }) => {
        state.results = state.results.map(shipper =>
          shipper.id === response.id ? response : shipper
        );
      })
      .addCase(createShipper.fulfilled, (state, action) => {
        state.results.push(action.payload.response);
      });
  },
});

export default shippersSlice.reducer;

export const selectAllShippers = (state: RootState, exclude: string[] = []) =>
  state.shippers.results.filter(({ id }) => !exclude.includes(id));

export const selectShipperById = (state: RootState, shipperId: string) =>
  state.shippers.results.find(shipper => shipper.id === shipperId);

export const selectShippersStatus = (state: RootState) => state.shippers.status;
