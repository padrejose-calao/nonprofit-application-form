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

  const handleLogin = (user: { id: string; email: string; name: string; role: 'admin' | 'user'; avatar?: string; lastLogin?: string; preferences?: { theme: 'light' | 'dark'; notifications: boolean; } }) => {
    // Convert the authentication user to our app user format
    const appUser: AppUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      organization: 'CALAO',
      role: user.role,
      createdAt: new Date().toISOString(),
      lastLogin: user.lastLogin || new Date().toISOString(),
      preferences: user.preferences
    };
    setCurrentUser(appUser);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };


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
