import { PayloadAction } from '@reduxjs/toolkit';
import { Match } from '../actions/MatchAction';

export function isReducerAction(name: string) {
  return (
    action: PayloadAction<unknown, string>
  ): action is PayloadAction<unknown, string> => {
    return action.type.startsWith(`${name}/`);
  };
}

export function haveDirectionsChanged(
  prevMatch: Match,
  newMatch: Match
): boolean {
  if (
    prevMatch.origin_address.formatted_address !==
    newMatch.origin_address.formatted_address
  )
    return true;

  if (prevMatch.stops?.length !== newMatch.stops?.length) return true;

  const prevAddr = prevMatch.stops
    .map(s => s.destination_address.formatted_address)
    .join('|');

  const newAddr = newMatch.stops
    .map(s => s.destination_address.formatted_address)
    .join('|');

  return prevAddr !== newAddr;
}
