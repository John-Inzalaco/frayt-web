import React from 'react';
import moment, { Moment, MomentInput } from 'moment';
import 'moment-timezone';
import { User } from './actions/UserAction';
import {
  Coupon,
  Fee,
  Match,
  MatchState,
  VehicleClass,
} from './actions/MatchAction';
import { Intent } from '@blueprintjs/core';

export const humanize = (s: string) =>
  s.replace(/^_*(.)|_+(.)/g, (s, c, d) =>
    c ? c.toUpperCase() : ' ' + d.toUpperCase()
  );

export const alphaIndex = (index: number) =>
  String.fromCharCode('A'.charCodeAt(0) + index);

export function formatMID(MID?: string) {
  // Format the Match ID correctly. 8 digit limit, uppercase. If undefined, return blank to prevent error.
  return MID ? MID.toUpperCase().substring(0, 8) : '';
}

export function formatDistance(mileage?: number) {
  // Format the mileage and return it as a string.
  return mileage ? mileage.toFixed(1) + ' mi' : '';
}

export function formatAddress(address = 'Debug City, OH') {
  // Do any formatting needed to display US addresses. Currently, this only involves taking out the ", USA" at the end that is automatically added in geocoded addresses.
  return address ? address.replace(', USA', '') : 'N/A';
}

function dateWithTZ(date: MomentInput, timezone?: string | null) {
  const m = moment.utc(date);

  return m.tz(timezone || moment.tz.guess());
}

export function nearestFutureStep(date: Moment, stepSize: number) {
  const minuteStep = stepSize / 60;
  const remainder = minuteStep - (date.minute() % minuteStep);
  return moment(date).add(remainder).second(0);
}

export function formatDate(date: string | number | Date) {
  const newDate = new Date(date).getTime();
  const currentDate = new Date().getTime();
  // Format 30 days in the past
  const timestamp = currentDate - 14 * 24 * 60 * 60 * 1000;
  //                             day hour  min  sec  msec
  if (newDate > timestamp) {
    return moment(newDate).fromNow();
  } else {
    return moment(newDate).format('MM/DD/YY');
  }
}

// This function is for taking a date and formatting it to be shown specifically for pickup and dropoff times
export function formatDateScheduling(
  date: MomentInput,
  timezone?: string | null
) {
  if (!date) {
    return <span>ASAP</span>;
  } else {
    const datetime = dateWithTZ(date, timezone);
    return (
      <>
        {datetime.format('MMMM D, h:mm A ')}
        <strong>{datetime.format('z')}</strong>
      </>
    );
  }
}

export function formatDateVerbose(date: MomentInput, timezone: string | null) {
  return dateWithTZ(date, timezone).format('MMMM D, YYYY');
}

export function formatDateSuccinct(date: MomentInput, timezone: string | null) {
  return dateWithTZ(date, timezone).format('MMM D, YYYY');
}

export function formatDateTime(datetime: MomentInput, timezone: string | null) {
  return dateWithTZ(datetime, timezone).format('MMM D, YYYY h:mm A z');
}

export function formatTime(time: MomentInput, timezone: string | null) {
  return dateWithTZ(time, timezone).format('h:mm A z');
}

export function formatMatchStatus(state: MatchState) {
  switch (state) {
    case 'admin_canceled':
      return 'Canceled';
    case 'accepted':
      return 'Driver Accepted';
    case 'arrived_at_pickup':
      return 'Arrived at Pickup Location';
    case 'unable_to_pickup':
      return 'Failed pickup';
    case 'completed':
    case 'charged':
      return 'Delivered';
    default:
      return humanize(state);
  }
}

export function formatMatchProgress({ state }: Match): {
  intent: Intent;
  value: number;
  stripes: boolean;
} {
  const states = Object.values(MatchState);
  const index = states.indexOf(state);
  const value = (index - 3) / (states.length - 4); // 0.142857143 is 1/7th; there are 7 possible stages to display on the progress bar
  let intent: Intent = Intent.DANGER;
  let stripes = false;

  switch (state) {
    case 'canceled':
    case 'admin_canceled':
      intent = Intent.WARNING;
      break;
    case 'completed':
    case 'charged':
      intent = Intent.SUCCESS;
      break;
    case 'unable_to_pickup':
      intent = Intent.WARNING;
      break;
    default:
      intent = Intent.PRIMARY;
      stripes = true;
      break;
  }

  return { intent, value, stripes };
}

export function formatVolume(volume?: number | null, decimals = 0) {
  const multiplier = Math.pow(10, decimals);
  return volume ? Math.ceil((volume / 1728) * multiplier) / multiplier : 0;
}

export function formatVehicle(vc: VehicleClass) {
  // Return the correct name of a vehicle type depending on it's ID number
  switch (vc) {
    case VehicleClass.BoxTruck:
      return 'Box Truck';
    case VehicleClass.CargoVan:
      return 'Cargo Van';
    case VehicleClass.Midsize:
      return 'Midsize';
    case VehicleClass.Car:
      return 'Car';
  }
}

export function formatVehicleImage(
  vc: VehicleClass,
  selectedVC?: VehicleClass
) {
  let vehicleName;
  switch (vc) {
    case VehicleClass.BoxTruck:
      vehicleName = 'box-truck';
      break;
    case VehicleClass.CargoVan:
      vehicleName = 'van';
      break;
    case VehicleClass.Midsize:
      vehicleName = 'suv';
      break;
    case VehicleClass.Car:
      vehicleName = 'car';
      break;
  }

  return `/img/vehicles/${
    vc === selectedVC ? 'blue' : 'gray'
  }/${vehicleName}.png`;
}

export function formatCurrentStateTime(match: Match): React.ReactNode {
  let state;
  let timestamp;

  switch (match.state) {
    case 'canceled':
    case 'admin_canceled':
      state = 'Canceled on';
      timestamp = match.canceled_at;
      break;
    case 'charged':
    case 'completed':
      state = 'Completed on';
      timestamp = match.completed_at;
      break;
    case 'accepted':
      state = 'Accepted on';
      timestamp = match.accepted_at;
      break;
    case 'assigning_driver':
      state = 'Activated on';
      timestamp = match.activated_at;
      break;
    case 'scheduled':
      state = 'Scheduled for';
      timestamp = match.picked_up_at;
      break;
  }

  if (state) {
    return (
      <>
        {state + ' '}
        {timestamp ? <br /> : null}
        {timestamp ? formatDateTime(timestamp, match.timezone) : null}
      </>
    );
  }

  return 'N/A';
}

export function formatPhoneNumber(phoneNumber: string) {
  const cleaned = ('' + phoneNumber).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3];
  }
  return null;
}

export function formatPhoneNumberSimplify(phoneNumber: string) {
  const cleaned = phoneNumber.replace(/-|\s/g, '');
  return cleaned;
}

// This function takes a date with no timezone, and returns the date with the specified timezone, without changing the time
export function formatDateWithTimezone(date: string, timezone: string | null) {
  if (!timezone) {
    timezone = moment.tz.guess();
  }
  return moment(date).tz(timezone).toString();
}

export function matchInState(match: Match, states: MatchState[]) {
  return states.includes(match.state);
}

export function centsToDollars(price: number) {
  return price / 100;
}

export function totalEstimatePrice(fees: Fee[]) {
  if (!fees) return 0;
  const priceInCents = fees.reduce((acc, fee) => acc + fee.amount, 0);
  return centsToDollars(priceInCents);
}

export function getSubtotal(fees: Fee[]) {
  return centsToDollars(fees.reduce((total, fee) => total + fee.amount, 0));
}

export function getFee(fees: Fee[], type: string) {
  if (fees) {
    const fee = fees.find(fee => fee.type === type);
    if (fee) {
      return centsToDollars(fee.amount);
    }
  }

  return 0;
}

export function findFee(fees: Fee[], type: string) {
  return fees?.find(fee => fee.type === type);
}

export function displayFee(fees: Fee[], type: string) {
  return '$' + getFee(fees, type).toFixed(2);
}

export function displayPrice(price: number, isCents = true) {
  price = isCents ? centsToDollars(price) : price;
  return '$' + price.toFixed(2);
}

export function getDiscount(fees: Fee[], coupon: Coupon | null) {
  const base_fee = getFee(fees, 'base_fee');
  return coupon && coupon.percentage ? coupon.percentage * 0.01 * base_fee : 0;
}

export const getUserCompany = (user: User | null) => {
  return typeof user?.company === 'string' ? undefined : user?.company;
};

export const getLocationOptions = (user: User) => {
  const locations = getUserCompany(user)?.locations || [];

  return locations.map(({ name, id }) => ({
    label: name,
    value: id,
  }));
};

export function chunkArray<T = unknown>(array: T[], perChunk: number) {
  return array.reduce<T[][]>((resultArray, item, index) => {
    const chunkIndex = Math.floor(index / perChunk);

    if (!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = []; // start a new chunk
    }

    resultArray[chunkIndex].push(item);

    return resultArray;
  }, []);
}

export function shallowEqual<T extends Record<string, unknown>>(
  object1: T,
  object2: T,
  ignore: (keyof T)[] = []
) {
  for (const key of ignore) {
    delete object1[key];
    delete object2[key];
  }

  const keys1 = Object.keys(object1) as (keyof typeof object1)[];
  const keys2 = Object.keys(object2) as (keyof typeof object2)[];
  if (keys1.length !== keys2.length) {
    return false;
  }
  for (const key of keys1) {
    if (object1[key] !== object2[key]) {
      return false;
    }
  }
  return true;
}

export function removeEmptyAttrs(obj: { [key: string]: unknown }) {
  (Object.keys(obj) as Array<keyof typeof obj>).forEach(
    k => obj[k] == null && delete obj[k]
  );

  return obj;
}

export function removeDuplicates<T = unknown>(
  arr: T[],
  by = (i: T): unknown => i
) {
  arr = [...arr].reverse();
  const byArr = arr.map(by);

  return arr.filter((i, index) => byArr.indexOf(by(i)) === index);
}

type ObjectWithKeys<K extends string> = {
  [Key in K]: unknown;
};

export function isObject<T extends string>(
  object: unknown,
  keys?: T[]
): object is ObjectWithKeys<T> {
  return (
    typeof object === 'object' &&
    object !== null &&
    (!keys || keys.every(key => key in object))
  );
}
