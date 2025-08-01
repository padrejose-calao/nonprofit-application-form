import React, { useState, useEffect } from 'react';
import { 
  Mail, Lock, Eye, EyeOff, User, Shield, AlertCircle, 
  CheckCircle, Chrome, LogIn, UserPlus, Settings, Key
} from 'lucide-react';
import { toast } from 'react-toastify';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  avatar?: string;
  lastLogin?: string;
  preferences?: {
    theme: 'light' | 'dark';
    notifications: boolean;
  };
}

interface AuthenticationSystemProps {
  onLogin: (user: User) => void;
  onLogout: () => void;
  currentUser: User | null;
}

const AuthenticationSystem: React.FC<AuthenticationSystemProps> = ({
  onLogin,
  onLogout,
  currentUser
}) => {
  const [loginMode, setLoginMode] = useState<'login' | 'register' | 'google'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Default accounts for demo/testing
  const defaultAccounts = {
    admin: {
      id: 'admin-001',
      email: 'admin@calao.org',
      password: 'CalaoAdmin2024!',
      name: 'CALAO Administrator',
      role: 'admin' as const,
      avatar: undefined,
      preferences: {
        theme: 'light' as const,
        notifications: true
      }
    },
    user: {
      id: 'user-001', 
      email: 'user@calao.org',
      password: 'CalaoUser2024!',
      name: 'CALAO User',
      role: 'user' as const,
      avatar: undefined,
      preferences: {
        theme: 'light' as const,
        notifications: true
      }
    }
  };

  // Check for saved session on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('calao_user_session');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        onLogin(user);
      } catch (error) {
        console.error('Error loading saved session:', error);
        localStorage.removeItem('calao_user_session');
      }
    }
  }, [onLogin]);

  const handleManualLogin = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check against default accounts
      const account = Object.values(defaultAccounts).find(
        acc => acc.email === email && acc.password === password
      );

      if (account) {
        const user: User = {
          id: account.id,
          email: account.email,
          name: account.name,
          role: account.role,
          avatar: account.avatar,
          lastLogin: new Date().toISOString(),
          preferences: account.preferences
        };

        // Save session if remember me is checked
        if (rememberMe) {
          localStorage.setItem('calao_user_session', JSON.stringify(user));
        }

        onLogin(user);
        toast.success(`Welcome back, ${user.name}!`);
      } else {
        toast.error('Invalid email or password');
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    
    try {
      // Simulate Google OAuth flow
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock Google user data
      const googleUser: User = {
        id: 'google-' + Math.random().toString(36).substr(2, 9),
        email: 'user@gmail.com',
        name: 'Google User',
        role: 'user',
        avatar: 'https://via.placeholder.com/40',
        lastLogin: new Date().toISOString(),
        preferences: {
          theme: 'light',
          notifications: true
        }
      };

      if (rememberMe) {
        localStorage.setItem('calao_user_session', JSON.stringify(googleUser));
      }

      onLogin(googleUser);
      toast.success(`Welcome, ${googleUser.name}!`);
    } catch (error) {
      toast.error('Google login failed. Please try again.');
      console.error('Google login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        id: 'reg-' + Math.random().toString(36).substr(2, 9),
        email,
        name,
        role: 'user',
        lastLogin: new Date().toISOString(),
        preferences: {
          theme: 'light',
          notifications: true
        }
      };

      if (rememberMe) {
        localStorage.setItem('calao_user_session', JSON.stringify(newUser));
      }

      onLogin(newUser);
      toast.success(`Account created successfully! Welcome, ${newUser.name}!`);
    } catch (error) {
      toast.error('Registration failed. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('calao_user_session');
    onLogout();
    toast.info('You have been logged out');
  };

  const quickLogin = (accountType: 'admin' | 'user') => {
    const account = defaultAccounts[accountType];
    setEmail(account.email);
    setPassword(account.password);
  };

  // If user is already logged in, show user info
  if (currentUser) {
    return (
      <div className="fixed top-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            {currentUser.avatar ? (
              <img src={currentUser.avatar} alt="User" className="w-10 h-10 rounded-full" />
            ) : (
              <User className="w-5 h-5 text-blue-600" />
            )}
          </div>
          <div className="flex-1">
            <div className="font-medium text-gray-900">{currentUser.name}</div>
            <div className="text-sm text-gray-500 flex items-center">
              {currentUser.role === 'admin' ? (
                <Shield className="w-3 h-3 mr-1 text-red-500" />
              ) : (
                <User className="w-3 h-3 mr-1 text-blue-500" />
              )}
              {currentUser.role}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
            title="Logout"
          >
            <LogIn className="w-4 h-4 rotate-180" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">CALAO Nonprofit Profile</h2>
          <p className="text-gray-600 mt-2">
            {loginMode === 'login' ? 'Sign in to your account' : 
             loginMode === 'register' ? 'Create a new account' : 
             'Sign in with Google'}
          </p>
        </div>

        {/* Quick Login Buttons for Demo */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="text-sm font-medium text-blue-900 mb-2">Quick Login (Demo):</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => quickLogin('admin')}
              className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 flex items-center justify-center"
            >
              <Shield className="w-3 h-3 mr-1" />
              Admin
            </button>
            <button
              onClick={() => quickLogin('user')}
              className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center justify-center"
            >
              <User className="w-3 h-3 mr-1" />
              User
            </button>
          </div>
          <div className="text-xs text-blue-700 mt-2">
            <div><strong>Admin:</strong> admin@calao.org / CalaoAdmin2024!</div>
            <div><strong>User:</strong> user@calao.org / CalaoUser2024!</div>
          </div>
        </div>

        {loginMode === 'google' ? (
          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Chrome className="w-5 h-5 mr-2" />
              )}
              {isLoading ? 'Signing in...' : 'Continue with Google'}
            </button>
            
            <button
              onClick={() => setLoginMode('login')}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-800"
            >
              Back to manual login
            </button>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); loginMode === 'login' ? handleManualLogin() : handleRegister(); }} className="space-y-4">
            {loginMode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="rememberMe" className="text-sm text-gray-600">
                Remember me
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : loginMode === 'login' ? (
                <LogIn className="w-4 h-4 mr-2" />
              ) : (
                <UserPlus className="w-4 h-4 mr-2" />
              )}
              {isLoading ? 'Please wait...' : 
               loginMode === 'login' ? 'Sign In' : 'Create Account'}
            </button>

            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-gray-300"></div>
              <div className="px-4 text-sm text-gray-500">or</div>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            <button
              type="button"
              onClick={() => setLoginMode('google')}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
            >
              <Chrome className="w-5 h-5 mr-2" />
              Continue with Google
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setLoginMode(loginMode === 'login' ? 'register' : 'login')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {loginMode === 'login' ? 
                  "Don't have an account? Sign up" : 
                  "Already have an account? Sign in"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthenticationSystem;