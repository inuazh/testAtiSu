import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/app/App';
import { enableMocking } from '@/shared/api/mocks/enableMocking';
import '@/app/styles/index.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root container #root not found');
}

enableMocking().then(() => {
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
