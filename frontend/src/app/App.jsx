import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '../state/AuthContext';
import { BrainProvider } from '../state/BrainContext';
import AppRoutes from './app.routes';
import '../styles/main.scss';

function App() {
  return (
    <AuthProvider>
      <BrainProvider>
        <Router>
          <AppRoutes />
        </Router>
      </BrainProvider>
    </AuthProvider>
  );
}

export default App;