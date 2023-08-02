import { FocusStyleManager } from '@blueprintjs/core';

// FontAwesome
import { library } from '@fortawesome/fontawesome-svg-core';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { faCheckSquare, faTruck } from '@fortawesome/pro-solid-svg-icons';
import AppRouter from './components/AppRouter';
import AppNavigation from './components/AppNavigation';
import { Provider } from 'react-redux';
import store from './lib/store';
import { GoogleMapsProvider } from './components/GoogleMapsProvider';
import OverlayNavigation from './components/OverlayNavigation';

library.add(fab, faCheckSquare, faTruck);

FocusStyleManager.onlyShowFocusOnTabs();

export default function App() {
  return (
    <Provider store={store}>
      <GoogleMapsProvider
        googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API}
        libraries={['geometry', 'drawing', 'places']}
      >
        <OverlayNavigation />
        <AppRouter headerElement={<AppNavigation />} />
      </GoogleMapsProvider>
    </Provider>
  );
}
