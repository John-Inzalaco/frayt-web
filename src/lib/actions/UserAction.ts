import { Token } from '@stripe/stripe-js';
import Axios, { AxiosResponse } from 'axios';
import { buildHeaders, buildUrl } from '../FraytRequest';
import { Location, Shipper } from './ShipperAction';
import * as Auth from '../AuthService';
import { ValidFlags } from '../reducers/userSlice';
import { Driver } from './MatchAction';

function getOneSignalId() {
  return (window as unknown as { oneSignalId?: string }).oneSignalId;
}

export async function forgotPassword(email: string): Promise<AxiosResponse> {
  const headers = buildHeaders({}, false);
  const url = buildUrl('forgot_password');

  return Axios.post(url, { email }, { headers });
}

export async function resetPassword(
  data: ResetPasswordData
): Promise<AxiosResponse<null>> {
  const headers = buildHeaders();
  const url = buildUrl('reset_password');

  return Axios.post(url, data, { headers });
}

export async function updatePassword(
  data: UpdatePasswordData
): Promise<AxiosResponse<null>> {
  const headers = buildHeaders();
  const url = buildUrl('password');

  return Axios.post(url, data, { headers });
}

export type AgreementsResponse = AxiosResponse<AgreementsResponseData>;

export type AgreementsResponseData = {
  agreement_documents: Agreement[];
};

export async function updateUserAgreements(
  data: AgreementData[]
): Promise<AgreementsResponse> {
  const headers = buildHeaders();
  const url = buildUrl('agreement_documents/shipper');

  return Axios.post(url, { agreements: data }, { headers });
}

export async function getUserAgreements(): Promise<AgreementsResponse> {
  const headers = buildHeaders();
  const url = buildUrl('agreement_documents/shipper');

  return Axios.get(url, { headers });
}

export type UserResponse = AxiosResponse<UserResponseData>;
export type UserResponseData = { response: User };

export async function getUser(): Promise<UserResponse> {
  if (Auth.getToken()) {
    const expires = Auth.getExpires();

    if (Auth.isTokenExpired(expires)) {
      Auth.unsetToken();

      throw Error('Authorization token has expired');
    }

    const headers = buildHeaders();
    const url = buildUrl('shipper');

    return Axios.get(url, { headers });
  }

  Auth.unsetToken();

  throw Error('User is unauthorized');
}

export async function updateUser(data: UserData): Promise<UserResponse> {
  const headers = buildHeaders();
  const url = buildUrl('shipper');

  return Axios.put(url, data, { headers });
}

export async function updateOneSignalID(): Promise<UserResponse> {
  const oneSignalId = getOneSignalId();
  if (oneSignalId) {
    const headers = buildHeaders();
    const url = buildUrl('shipper');

    const response = await Axios.put(
      url,
      { one_signal_id: oneSignalId },
      { headers }
    );

    return response;
  } else {
    throw Error('Failed to get OneSignal ID');
  }
}

export type AuthUserResponse = AxiosResponse<AuthUserResponseData>;

export type AuthUserResponseData = {
  response: { shipper: User; token: string };
};

export async function registerUser(
  data: Partial<NewUserData>
): Promise<AuthUserResponse> {
  const oneSignalId = getOneSignalId();
  const headers = buildHeaders({}, false);
  const url = buildUrl('shippers');

  const response = await Axios.post<AuthUserResponseData>(
    url,
    { ...data, one_signal_id: oneSignalId },
    { headers }
  );

  Auth.setToken(response.data.response.token);

  return response;
}

export async function loginUser(data: LoginData): Promise<AuthUserResponse> {
  const headers = buildHeaders({}, false);
  const url = buildUrl('sessions/shippers');

  const response = await Axios.post<AuthUserResponseData>(url, data, {
    headers,
  });

  Auth.setToken(response.data.response.token);

  return response;
}

export type LogoutResponse = AxiosResponse<LogoutResponseData>;
export type LogoutResponseData = { message: string };

export async function logoutUser(): Promise<LogoutResponse> {
  const headers = buildHeaders();
  const url = buildUrl('sessions/logout');

  try {
    const response = await Axios.delete(url, { headers });

    Auth.unsetToken();
    sessionStorage.removeItem('weightInfo');

    window.location.href = '/';

    return response;
  } catch (error) {
    Auth.unsetToken();

    window.location.href = '/';

    throw error;
  }
}

export type CreditCardResponse = AxiosResponse<CreditCardResponseData>;
export type CreditCardResponseData = {
  response: { credit_card: string } | null;
};

export async function getCreditCard(): Promise<CreditCardResponse> {
  const headers = buildHeaders();
  const url = buildUrl('credit_card');

  return Axios.get(url, { headers });
}

export async function updateCreditCard(
  data: CreditCardData
): Promise<CreditCardResponse> {
  const headers = buildHeaders();
  const url = buildUrl('credit_cards');

  return Axios.post(url, data, { headers });
}

export type GetAddressesResponse = AxiosResponse<{ response: Address[] }>;

export async function getAddresses(): Promise<GetAddressesResponse> {
  const headers = buildHeaders();
  const url = buildUrl('addresses');

  return Axios.get(url, { headers });
}

export type FeatureFlagResponse = AxiosResponse<FeatureFlagResponseData>;
export type FeatureFlagResponseData = {
  enabled: boolean | null;
};

export async function getFeatureFlag(params: {
  flag: ValidFlags;
}): Promise<FeatureFlagResponse> {
  const headers = buildHeaders();
  const url = buildUrl('feature_flags');

  return Axios.get(url, { params, headers });
}

export type InteractedDriversResponse =
  AxiosResponse<InteractedDriversResponseData>;

export type InteractedDriversResponseData = {
  data: Driver[];
};

export async function getInteractedDrivers(): Promise<InteractedDriversResponse> {
  const headers = buildHeaders();
  const url = buildUrl('shipper/drivers');

  return Axios.get(url, { headers });
}

export type PreferredDriverResponse =
  AxiosResponse<PreferredDriverResponseData>;

export type PreferredDriverResponseData = {
  data: Driver[];
};

export async function getPreferredDriverByEmail(params: {
  email: string;
}): Promise<PreferredDriverResponse> {
  const headers = buildHeaders();
  const url = buildUrl('shipper/drivers');

  return Axios.get(url, { params, headers });
}

export function getUserData({
  address,
  state,
  company,
  first_name,
  last_name,
  phone,
  email,
}: User): UserData {
  return {
    company: typeof company === 'string' ? company : undefined,
    address,
    state,
    first_name,
    last_name,
    phone,
    email,
  };
}

export type CreditCardData = {
  stripe_token: Token['id'];
  stripe_card: string;
};

export type AgreementData = {
  document_id: string;
  agreed: boolean;
};

export type Agreement = {
  id: string;
  url: string;
  title: string;
  support_documents: Agreement[];
};

export type Contract = {
  id: string;
  name: string;
  contract_key: string;
};

export type User = {
  address: AddressData | null;
  password_reset_code: boolean;
  location: Location | null;
  company: Company | string;
  pending_agreements: Agreement[];
} & Shipper;

export type AddressData = PickRequired<
  Address,
  'city' | 'state' | 'address' | 'zip'
>;

export type UserData = {
  company?: string;
  address: AddressData | null;
} & Omit<
  User,
  | 'role_label'
  | 'role'
  | 'location'
  | 'pending_agreements'
  | 'id'
  | 'company'
  | 'password_reset_code'
>;

export type LoginData = Pick<NewUserData, 'password' | 'email'>;
export type UpdatePasswordData = {
  new: string;
  old: string;
};
export type ResetPasswordData = {
  password_reset_code: string;
  password: string;
  password_confirmation: string;
};

export type NewUserData = {
  password: string;
  one_signal_id: string;
  agreements: AgreementData[];
  commercial: boolean;
} & UserData;

export type Company = {
  id: string;
  name: string;
  account_billing_enabled: boolean;
  invoice_period: number;
  locations: Location[];
  contracts: Contract[];
};

export type Address = {
  lat: number;
  lng: number;
  formatted_address: string;
  address: string;
  address2: string;
  city: string;
  state: string;
  state_code: string;
  zip: string;
  country: string;
  neighborhood: string;
  name: string | null;
};
