declare global {
  namespace NodeJS {
    interface ProcessEnv {
      REACT_APP_FRAYT_API: string;
      REACT_APP_STRIPE_CODE: string;
      PUBLIC_URL?: string;
      REACT_APP_SENTRY_ENV?: string;
      REACT_APP_SENTRY_DSN?: string;
      REACT_APP_RELEASE_VERSION?: string;
      REACT_APP_VERSION: string;
      REACT_APP_GOOGLE_MAPS_API: string;
      NODE_ENV: 'development' | 'production';
      PORT?: string;
      PWD: string;
    }
  }
}

export {}