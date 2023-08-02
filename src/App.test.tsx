import { createRoot } from 'react-dom/client';
import App from './App';

// eslint-disable-next-line jest/expect-expect
it('renders without crashing', () => {
  const container = document.createElement('div');
  const root = createRoot(container);
  root.render(<App />);
  root.unmount();
});
