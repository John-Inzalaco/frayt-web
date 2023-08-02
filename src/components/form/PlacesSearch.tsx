import PlacesAutocomplete, {
  geocodeByAddress,
} from 'react-places-autocomplete';
import { InputGroup, MaybeElement, Spinner } from '@blueprintjs/core';
import { RecentAddressesSelect } from '../RecentAddressSelect';
import { useSelector } from 'react-redux';
import { selectAuthStatus } from '../../lib/reducers/userSlice';
import { Address } from '../../lib/actions/UserAction';
import { useGoogleMaps } from '../GoogleMapsProvider';
import { useField } from 'formik';
import { BlueprintIcons_16Id } from '@blueprintjs/icons/lib/esm/generated/16px/blueprint-icons-16';
import { useEffect, useState } from 'react';
import TextButton from '../TextButton';
import { usePrevious } from '../../lib/Hooks';

type PlacesSearchProps = {
  icon: MaybeElement | BlueprintIcons_16Id;
  name: string;
  placeName: string;
};

export function PlacesSearch({ name, placeName, icon }: PlacesSearchProps) {
  const [
    { value: address },
    ,
    { setValue: setAddressValue, setTouched: setAddressTouched },
  ] = useField<string>(name);
  const [, , { setValue: setPlaceValue, setTouched: setPlaceTouched }] =
    useField<string | null>(placeName);
  const [value, setValue] = useState<string>(address);
  const [isFocused, setFocused] = useState(false);
  const { isLoaded } = useGoogleMaps();
  const authStatus = useSelector(selectAuthStatus);
  const prevAddress = usePrevious(address);

  const updateValue = (address: string, placeId?: string) => {
    setPlaceTouched(true, false);
    setAddressTouched(true, false);
    setPlaceValue(placeId || null, false);
    setAddressValue(address);
    setValue(address);
  };

  const handleSelect = (address: string, placeId?: string) => {
    if (!placeId) {
      geocodeByAddress(address).then(results => {
        placeId = results[0].place_id;
        address = results[0].formatted_address;
        updateValue(address, placeId);
      });
    } else {
      updateValue(address, placeId);
    }
  };

  const handleError = (status: string, clearSuggestions: () => void) => {
    clearSuggestions();
  };

  const handleBlur = () => {
    setFocused(false);
    setAddressTouched(true);
  };

  const handleFocus = () => {
    setFocused(true);
  };

  const handleItemSelect = ({ address: a }: Address) =>
    address !== a && handleSelect(a);

  useEffect(() => {
    if (address !== prevAddress && value !== address) setValue(address);
  }, [address, value, prevAddress]);

  return isLoaded ? (
    <>
      <PlacesAutocomplete
        value={isFocused ? value : address}
        onChange={setValue}
        onSelect={handleSelect}
        onError={handleError}
      >
        {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
          <div className='PlacesAutocomplete'>
            <InputGroup
              {...getInputProps({
                placeholder: 'Search Places ...',
                className: 'location-search-input',
                leftIcon: icon,
              })}
              onBlur={handleBlur}
              onFocus={handleFocus}
              rightElement={
                authStatus === 'succeeded' ? (
                  <RecentAddressesSelect onItemSelect={handleItemSelect} />
                ) : undefined
              }
            />

            {isFocused && value !== address && (
              <div className='PlacesAutocompleteDropdownContainer'>
                {loading && <div className='suggestion-item'>Loading...</div>}
                {suggestions.length === 0 && (
                  <div className='suggestion-item'>No Results</div>
                )}
                {suggestions.map(suggestion => {
                  const className =
                    'suggestion-item ' +
                    (suggestion.active ? 'suggestion-item--active' : '');

                  return (
                    <div
                      {...getSuggestionItemProps(suggestion, {
                        className,
                      })}
                      key={suggestion.index}
                    >
                      <span>{suggestion.description}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </PlacesAutocomplete>
      {!isFocused && value && value !== address && (
        <p className='error'>
          Warning: you did not select an address after entering your search.{' '}
          <TextButton onClick={() => setValue(address)}>Ignore</TextButton>
        </p>
      )}
    </>
  ) : (
    <div>
      <Spinner />
    </div>
  );
}
