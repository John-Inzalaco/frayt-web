import Axios, { AxiosResponse } from 'axios';
import { buildHeaders, buildUrl } from '../FraytRequest';
import { Driver } from './MatchAction';
import QueryString from 'qs';

export type ShippersResponse = AxiosResponse<ShippersResponseData>;

export type ShippersResponseData = {
  data: Shipper[];
  page_count: number;
};

export type DriversResponse = AxiosResponse<DriversResponseData>;

export type DriversResponseData = {
  data: Driver[];
};

export async function fetchShippers(
  filters: ShippersFilters
): Promise<ShippersResponse> {
  const params = QueryString.stringify({ per_page: 20, ...filters });
  const headers = buildHeaders();
  const url = buildUrl(`shippers?${params}`);

  return Axios.get(url, { headers });
}

export type ShipperResponse = AxiosResponse<ShipperResponseData>;
export type ShipperResponseData = { response: Shipper };

export async function updateShipper(
  shipper_id: string,
  data: Partial<ShipperData>
): Promise<ShipperResponse> {
  const headers = buildHeaders();
  const url = buildUrl(`shippers/${shipper_id}`);

  return Axios.put(url, data, { headers });
}

export async function createShipper(
  data: Partial<ShipperData>
): Promise<ShipperResponse> {
  const headers = buildHeaders();
  const url = buildUrl(`shippers`);

  return Axios.post(url, data, { headers });
}

export type ShippersFilters = {
  disabled?: boolean;
  role?: ShipperRole;
  query?: string;
  location_id?: string;
  cursor?: number;
  per_page?: number;
};

export type ShipperRole = 'company_admin' | 'location_admin' | 'member';

export type ShipperData = {
  location_id: string;
  user: { email: string };
} & Omit<Shipper, 'email' | 'location' | 'id' | 'role_label'>;

export enum ShipperState {
  Approved = 'approved',
  PendingApproval = 'pending_approval',
  Disabled = 'disabled',
}

export type Shipper = {
  id: string;
  phone: string;
  role: ShipperRole;
  role_label: string;
  email: string;
  first_name: string;
  last_name: string;
  state: ShipperState | null;
  location: Location | null;
};

export type Location = {
  id: string;
  name: string;
  address: string;
  address2: string;
  neighborhood: string;
  city: string;
  county: string;
  state: string;
};
