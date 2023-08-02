import Axios, { AxiosResponse } from 'axios';
import QueryString from 'qs';
import { buildHeaders, buildUrl } from '../FraytRequest';
import { isObject } from '../Utility';
import { Shipper } from './ShipperAction';
import { Address, Contract } from './UserAction';

export type MatchResponse = AxiosResponse<{ response: Match }>;
export type MatchResponseData = { response: Match };

export async function duplicateMatch(
  matchId: string,
  data: MatchData
): Promise<MatchResponse> {
  const headers = buildHeaders();
  const url = buildUrl(`matches/${matchId}/duplicate`);

  return Axios.post(url, data, { headers });
}

export async function cancelMatch(
  matchId: string,
  reason: string
): Promise<MatchResponse> {
  const headers = buildHeaders();
  const url = buildUrl(`matches/${matchId}`);

  return Axios.delete(url, { data: { reason }, headers });
}

export async function createMatch(data: NewMatchData): Promise<MatchResponse> {
  const headers = buildHeaders();
  const url = buildUrl(`matches`);

  return Axios.post(url, data, { headers });
}

export async function updateMatch(
  matchId: string,
  data: MatchData | AuthorizedMatchData | { state: 'authorized' }
): Promise<MatchResponse> {
  const headers = buildHeaders();
  const url = buildUrl(`matches/${matchId}`);

  return Axios.put(url, data, { headers });
}

export async function authorizeMatch(matchId: string): Promise<MatchResponse> {
  return updateMatch(matchId, { state: 'authorized' });
}

export async function getMatch(matchId: string): Promise<MatchResponse> {
  const headers = buildHeaders();
  const url = buildUrl(`matches/${matchId}`);

  return Axios.get(url, { headers });
}

export async function updatePreferredDriverById(
  matchId: string,
  data: {
    platform?: string;
    preferred_driver_id: string | null;
  }
): Promise<MatchResponse> {
  const headers = buildHeaders();
  const url = buildUrl(`matches/${matchId}`);

  return Axios.put(url, data, { headers });
}

export type MatchesResponse = AxiosResponse<MatchesResponseData>;

export type MatchesResponseData = {
  response: Match[];
  page_count: number;
};

export async function getMatches(
  filters: MatchFilters
): Promise<MatchesResponse> {
  const params = QueryString.stringify(filters);
  const headers = buildHeaders();
  const url = buildUrl(`matches?${params}`);

  return Axios.get(url, { headers });
}

export type MatchFilters = {
  states?: string;
  search?: string;
  location_id?: string;
  shipper_id?: string;
  page: number;
  per_page: number;
};

export type Match = {
  id: string;
  shipper: Shipper | null;
  coupon: null | Coupon;
  total_distance: number;
  total_weight: number;
  total_volume: number;
  total_price: number;
  price_discount: number;
  service_level: ServiceLevel;
  vehicle_class: VehicleClass;
  stops: MatchStop[];
  fees: Fee[];
  dropoff_at: string | null;
  pickup_at: string | null;
  scheduled: boolean;
  pickup_notes: string | null;
  po: string | null;
  shortcode: string;
  identifier: string | null;
  state: MatchState;
  sender: Contact | null;
  market: Market | null;
  self_sender: boolean;
  origin_address: Address;
  inserted_at: string;
  picked_up_at: string | null;
  activated_at: string | null;
  accepted_at: string | null;
  completed_at: string | null;
  canceled_at: string | null;
  cancel_reason: string | null;
  contract: Contract | null;
  bill_of_lading_photo: string | null;
  origin_photo: string | null;
  driver: Driver | null;
  rating: number | null;
  rating_reason: string | null;
  unload_method: UnloadMethod | null;
  optimized_stops: boolean;
  timezone: string | null;
  origin_photo_required: boolean;
  bill_of_lading_required: boolean;
  preferred_driver_id: string | undefined;
  preferred_driver: Driver | undefined;
  platform: 'marketplace' | 'deliver_pro';
};

export function isMatch(match: unknown) {
  return isObject(match, ['id', 'stops']);
}

export type MatchData = {
  coupon_code?: string | null;
  optimize?: boolean;
  origin_address?: string | null;
  origin_place_id?: string | null;
  sender?: ContactData | null;
  stops?: MatchStopData[];
  contract_id?: string | null;
} & PickOptional<
  Match,
  | 'service_level'
  | 'vehicle_class'
  | 'po'
  | 'scheduled'
  | 'pickup_at'
  | 'dropoff_at'
  | 'unload_method'
  | 'pickup_notes'
  | 'self_sender'
  | 'bill_of_lading_required'
  | 'origin_photo_required'
  | 'preferred_driver_id'
  | 'platform'
>;

export type NewMatchData = {
  stops?: NewMatchStopData[];
} & MatchData;

export type AuthorizedMatchData = PickOptional<
  Match,
  'rating' | 'rating_reason'
>;

export type MatchStop = {
  state: MatchStopState;
  index: number;
  recipient: Contact | null;
  self_recipient: boolean;
  delivery_notes: string | null;
  destination_address: Address;
  signature_photo: string | null;
  signature_name: string | null;
  signature_type: SignatureType;
  signature_instructions: string | null;
  destination_photo: string | null;
  destination_photo_required: boolean;
  has_load_fee: boolean;
  needs_pallet_jack: boolean;
  driver_tip: number;
  id: string;
  identifier: string | null;
  dropoff_by: string | null;
  items: MatchStopItem[];
  state_transition: StateTransition<MatchStopState>;
  signature_required: boolean;
  po: string | null;
};

export type MatchStopData = {
  destination_address?: string | null;
  destination_place_id?: string | null;
  items?: MatchStopItemData[];
  recipient?: ContactData | null;
} & PickOptional<
  MatchStop,
  | 'id'
  | 'dropoff_by'
  | 'has_load_fee'
  | 'needs_pallet_jack'
  | 'index'
  | 'po'
  | 'delivery_notes'
  | 'self_recipient'
  | 'signature_required'
  | 'signature_type'
  | 'signature_instructions'
  | 'destination_photo_required'
>;

export type NewMatchStopData = {
  items?: NewMatchStopItemData[];
} & Omit<MatchStopData, 'id'>;

export type MatchStopItem = {
  id: string;
  barcode_readings: BarcodeReading[];
} & Required<MatchStopItemData>;

export type MatchStopItemData = {
  id?: string;
  height?: number | null;
  length?: number | null;
  width?: number | null;
  volume?: number | null;
  pieces?: number;
  weight?: number;
  description?: string | null;
  type?: MatchStopItemType;
  barcode?: string | null;
  barcode_delivery_required?: boolean;
  barcode_pickup_required?: boolean;
  declared_value?: number | null;
};

export type NewMatchStopItemData = Omit<MatchStopItemData, 'id'>;

export type BarcodeReading = {
  type: BarcodeReadingType;
  state: BarcodeReadingState;
  photo: string | null;
  barcode: string | null;
  inserted_at: string | null;
  item_id: string;
};

export type StateTransition<S> = {
  notes: string | null;
  updated_at: string | null;
  from: S;
  to: S;
};

export type Coupon = {
  percentage: number;
  code: string;
};

export type Market = {
  has_box_trucks: boolean;
};

export type Contact = {
  id: string;
} & Required<ContactData>;

export type ContactData = {
  name: string;
  email?: string | null;
  notify: boolean;
  phone_number?: string | null;
};

export type Fee = {
  id: string;
  amount: number;
  description: string | null;
  type: string;
  name: string;
};

export type Driver = {
  id: string;
  email: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  profile_image: string | null;
  current_location: DriverLocation | null;
  vehicle: Vehicle;
};

export type DriverLocation = {
  id: string;
  lat: number;
  lng: number;
  created_at: string;
};

export type Vehicle = {
  id: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number;
  vehicle_class: VehicleClass;
};

export enum ServiceLevel {
  Dash = 1,
  SameDay = 2,
}

export enum VehicleClass {
  Car = 1,
  Midsize = 2,
  CargoVan = 3,
  BoxTruck = 4,
}

export enum UnloadMethod {
  DockToDock = 'dock_to_dock',
  LiftGate = 'lift_gate',
}

export enum MatchState {
  DriverCanceled = 'driver_canceled',
  AdminCanceled = 'admin_canceled',
  Canceled = 'canceled',
  Pending = 'pending',
  Inactive = 'inactive',
  Scheduled = 'scheduled',
  AssigningDriver = 'assigning_driver',
  Accepted = 'accepted',
  EnRouteToPickup = 'en_route_to_pickup',
  ArrivedAtPickup = 'arrived_at_pickup',
  PickedUp = 'picked_up',
  Completed = 'completed',
  Charged = 'charged',
  UnableToPickup = 'unable_to_pickup',
}

export enum MatchStopState {
  Unserved = 'unserved',
  Undeliverable = 'undeliverable',
  Pending = 'pending',
  EnRoute = 'en_route',
  Arrived = 'arrived',
  Signed = 'signed',
  Delivered = 'delivered',
  Returned = 'returned',
}

export enum MatchStopItemType {
  Item = 'item',
  Pallet = 'pallet',
}

export enum BarcodeReadingType {
  Pickup = 'pickup',
  Delivery = 'delivery',
}

export enum BarcodeReadingState {
  Captured = 'captured',
  Missing = 'missing',
}

export enum SignatureType {
  Electronic = 'electronic',
  Photo = 'photo',
}
