import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';
import '@blueprintjs/core/lib/css/blueprint.css';
import './index.css';
import './App.css';
import App from './App';
import { unregister } from './registerServiceWorker';
import { createRoot } from 'react-dom/client';

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  release: `frayt-web@${
    process.env.REACT_APP_RELEASE_VERSION || process.env.REACT_APP_VERSION
  }`,
  environment: process.env.REACT_APP_SENTRY_ENV || process.env.NODE_ENV,
  integrations: [new Integrations.BrowserTracing()],
  tracesSampleRate: 0.5,
});

const container = document.getElementById('root');
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!); // we need to force this as #root will always be defined
root.render(<App />);

unregister();
