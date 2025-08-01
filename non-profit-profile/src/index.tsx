import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { logger } from './utils/logger';
import './index.css';
import './output.css';
import App from './App';

logger.debug('index.tsx loaded');

const rootElement = document.getElementById('root');
logger.debug('Root element:', rootElement as any);

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  logger.debug('React root created');
  root.render(
    <React.StrictMode>
      <App />
      <ToastContainer />
    </React.StrictMode>
  );
  logger.debug('React render called');
} else {
  logger.error('Root element not found!');
}
