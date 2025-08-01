import React, { useState, useEffect } from 'react';
import { Chrome, AlertCircle } from 'lucide-react';
import { googleDriveBackupService } from '../services/googleDriveBackupService';
import { useNotification } from '../hooks/useNotification';

interface GoogleOAuthButtonProps {
  onSuccess?: (accessToken: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

// Google OAuth2 configuration
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';
const GOOGLE_REDIRECT_URI = process.env.REACT_APP_GOOGLE_REDIRECT_URI || window.location.origin + '/auth/google/callback';
const GOOGLE_SCOPE = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.appdata';

const GoogleOAuthButton: React.FC<GoogleOAuthButtonProps> = ({
  onSuccess,
  onError,
  className = ''
}) => {
  const { addNotification } = useNotification();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if we're returning from OAuth redirect
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    
    if (code && state === sessionStorage.getItem('oauth_state')) {
      handleOAuthCallback(code);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateState = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const initiateOAuth = () => {
    if (!GOOGLE_CLIENT_ID) {
      const errorMsg = 'Google Client ID not configured';
      setError(errorMsg);
      addNotification({
        id: 'oauth-error',
        type: 'error',
        title: 'Configuration Error',
        message: errorMsg,
        duration: 5000
      });
      onError?.(errorMsg);
      return;
    }

    setIsAuthenticating(true);
    setError(null);

    // Generate and store state for CSRF protection
    const state = generateState();
    sessionStorage.setItem('oauth_state', state);

    // Build OAuth URL
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: GOOGLE_REDIRECT_URI,
      response_type: 'code',
      scope: GOOGLE_SCOPE,
      state: state,
      access_type: 'offline',
      prompt: 'consent'
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    
    // Redirect to Google OAuth
    window.location.href = authUrl;
  };

  const handleOAuthCallback = async (code: string) => {
    try {
      setIsAuthenticating(true);
      setError(null);

      // Exchange code for access token using Netlify function
      const response = await fetch('/.netlify/functions/google-oauth-exchange', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code,
          redirect_uri: GOOGLE_REDIRECT_URI
        })
      });

      if (!response.ok) {
        throw new Error('Failed to exchange authorization code');
      }

      const data = await response.json();
      
      if (data.access_token) {
        // Configure Google Drive backup service
        const success = await googleDriveBackupService.configureAccess(data.access_token);
        
        if (success) {
          addNotification({
            id: 'oauth-success',
            type: 'success',
            title: 'Google Drive Connected',
            message: 'Your data will now be automatically backed up to Google Drive',
            duration: 5000
          });
          
          onSuccess?.(data.access_token);
        } else {
          throw new Error('Failed to configure Google Drive access');
        }
      } else {
        throw new Error('No access token received');
      }
    } catch (error) {
      const errorMsg = (error as Error).message || 'Authentication failed';
      setError(errorMsg);
      
      addNotification({
        id: 'oauth-error',
        type: 'error',
        title: 'Authentication Failed',
        message: errorMsg,
        duration: 5000
      });
      
      onError?.(errorMsg);
    } finally {
      setIsAuthenticating(false);
      // Clear OAuth state
      sessionStorage.removeItem('oauth_state');
    }
  };

  if (!GOOGLE_CLIENT_ID) {
    return (
      <div className={`p-4 bg-yellow-50 border border-yellow-200 rounded-md ${className}`}>
        <div className="flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-800">
              Google Drive Integration Not Configured
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              To enable Google Drive backup, set REACT_APP_GOOGLE_CLIENT_ID in your environment variables.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <button
        onClick={initiateOAuth}
        disabled={isAuthenticating}
        className={`
          flex items-center gap-3 px-4 py-2 rounded-md font-medium
          ${isAuthenticating 
            ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }
        `}
      >
        <Chrome className="h-5 w-5" />
        <span>
          {isAuthenticating ? 'Connecting...' : 'Connect Google Drive'}
        </span>
      </button>
      
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default GoogleOAuthButton;