import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleReportError = () => {
    const errorData = {
      error: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };
    
    // In production, send to error reporting service
    console.log('Error Report:', errorData);
    
    // Copy to clipboard for manual reporting
    navigator.clipboard.writeText(JSON.stringify(errorData, null, 2)).then(() => {
      alert('Error details copied to clipboard. Please paste this in your error report.');
    });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-8">
            <div className="flex items-center mb-6">
              <div className="bg-red-100 p-3 rounded-full mr-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-red-800">Something went wrong</h1>
                <p className="text-red-600 mt-1">
                  The application encountered an unexpected error.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">Error Details:</h3>
              <p className="text-sm text-gray-700 font-mono bg-white p-3 rounded border">
                {this.state.error?.message || 'Unknown error occurred'}
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error?.stack && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800">
                    Stack Trace (Development)
                  </summary>
                  <pre className="text-xs text-gray-600 mt-2 p-3 bg-gray-100 rounded overflow-x-auto">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex gap-3">
                <button
                  onClick={this.handleReset}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center transition-colors"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Try Again
                </button>
                <button
                  onClick={this.handleReload}
                  className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 flex items-center justify-center transition-colors"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Reload Page
                </button>
              </div>
              
              <button
                onClick={this.handleReportError}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 flex items-center justify-center transition-colors text-sm"
              >
                <Bug className="w-4 h-4 mr-2" />
                Copy Error Report
              </button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">What you can try:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Refresh the page to restart the application</li>
                <li>• Clear your browser cache and cookies</li>
                <li>• Try using a different browser or incognito mode</li>
                <li>• Check your internet connection</li>
                <li>• Contact support if the problem persists</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;