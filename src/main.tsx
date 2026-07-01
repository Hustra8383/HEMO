import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initApiMock } from './apiMock.ts';

// Enable self-healing dual-mode client database fallback for static environments like Netlify
initApiMock();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
