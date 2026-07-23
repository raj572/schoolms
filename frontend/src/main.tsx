

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { AppInitializer } from './components/Dashboard/AppInitializer.tsx';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
  <AppInitializer>
    <App />
  </AppInitializer>
  </BrowserRouter>
  
);
