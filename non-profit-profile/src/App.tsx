import React, { useState } from 'react';
import './App.css';
import { User } from './services/api';
import NonprofitApplication from './components/NonprofitApplication';
import AuthenticationSystem from './components/AuthenticationSystem';
import TestComponent from './TestComponent';
import ErrorBoundary from './components/ErrorBoundary';
import { PermissionsProvider } from './components/PermissionsManager';

interface AppUser extends User {
  role: 'admin' | 'user';
  preferences?: {
    theme: 'light' | 'dark';
    notifications: boolean;
  };
}

function App() {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);

  const handleLogin = (user: any) => {
    // Convert the authentication user to our app user format
    const appUser: AppUser = {
      id: parseInt(user.id) || 1,
      email: user.email,
      name: user.name,
      organization: user.organization || 'CALAO',
      role: user.role,
      createdAt: user.createdDate || new Date().toISOString(),
      lastLogin: user.lastLogin || new Date().toISOString(),
      preferences: user.preferences
    };
    setCurrentUser(appUser);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // Add console log to debug
  console.log('App component rendering', { currentUser });

  // Test with simple component first
  const useTestComponent = false;
  
  if (useTestComponent) {
    return (
      <div className="App">
        <TestComponent />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="App">
        {currentUser ? (
          <ErrorBoundary>
            <PermissionsProvider>
              <NonprofitApplication currentUser={currentUser} onLogout={handleLogout} />
            </PermissionsProvider>
          </ErrorBoundary>
        ) : (
          <ErrorBoundary>
            <AuthenticationSystem 
              onLogin={handleLogin}
              onLogout={handleLogout}
              currentUser={currentUser}
            />
          </ErrorBoundary>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
