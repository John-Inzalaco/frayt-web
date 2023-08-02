import { createContext, useContext } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';

export type GoogleMapsState = {
  isLoaded: boolean;
  loadError?: Error;
};

export type GoogleMapsProviderProps = {
  children: React.ReactNode;
} & Parameters<typeof useJsApiLoader>[0];

const GoogleMapsContext = createContext<GoogleMapsState>({ isLoaded: false });

export function GoogleMapsProvider({
  children,
  ...loadScriptOptions
}: GoogleMapsProviderProps) {
  const { isLoaded, loadError } = useJsApiLoader(loadScriptOptions);

  return (
    <GoogleMapsContext.Provider value={{ isLoaded, loadError }}>
      {children}
    </GoogleMapsContext.Provider>
  );
}

export const useGoogleMaps = () => useContext(GoogleMapsContext);
