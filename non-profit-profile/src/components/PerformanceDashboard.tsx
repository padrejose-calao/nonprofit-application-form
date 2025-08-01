import React, { useState, useEffect } from 'react';
import { 
  Activity, Clock, Zap, BarChart3, AlertTriangle, 
  CheckCircle, X, RefreshCw, Monitor, Smartphone,
  Globe, Database, Wifi, TrendingUp
} from 'lucide-react';
import { useLoadPerformance } from '../hooks/usePerformanceMonitor';

interface PerformanceDashboardProps {
  onClose: () => void;
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ onClose }) => {
  const loadMetrics = useLoadPerformance();
  const [memoryInfo, setMemoryInfo] = useState<any>(null);
  const [connectionInfo, setConnectionInfo] = useState<any>(null);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);

  useEffect(() => {
    // Get memory info if available
    if ((performance as any).memory) {
      setMemoryInfo((performance as any).memory);
    }

    // Get connection info if available
    if ((navigator as any).connection) {
      setConnectionInfo((navigator as any).connection);
    }

    // Get device info
    setDeviceInfo({
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      colorDepth: window.screen.colorDepth
    });
  }, []);

  const getPerformanceScore = () => {
    let score = 100;
    
    // Deduct points based on metrics
    if (loadMetrics.firstContentfulPaint > 2000) score -= 20;
    if (loadMetrics.largestContentfulPaint > 4000) score -= 20;
    if (loadMetrics.domContentLoaded > 1000) score -= 15;
    if (memoryInfo?.usedJSHeapSize > 50 * 1024 * 1024) score -= 15; // > 50MB
    if (connectionInfo?.downlink < 1) score -= 10; // < 1 Mbps
    
    return Math.max(0, score);
  };

  const formatBytes = (bytes: number) => {
    if (!bytes) return 'N/A';
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  const formatTime = (time: number) => {
    if (!time) return 'N/A';
    return `${time.toFixed(0)} ms`;
  };

  const performanceScore = getPerformanceScore();
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center space-x-4">
            <Activity className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold">Performance Dashboard</h2>
              <p className="text-sm text-gray-600">
                Real-time application performance metrics
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-gray-700 hover:bg-white/50 rounded-lg flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {/* Overall Score */}
          <div className={`p-6 rounded-lg mb-6 ${getScoreBg(performanceScore)}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Overall Performance Score</h3>
                <p className="text-sm text-gray-600">Based on key web vitals and metrics</p>
              </div>
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(performanceScore)}`}>
                  {performanceScore}
                </div>
                <div className="text-sm text-gray-600">out of 100</div>
              </div>
            </div>
          </div>

          {/* Core Web Vitals */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <Zap className="w-5 h-5 text-yellow-600" />
                <span className={`text-sm ${loadMetrics.firstContentfulPaint < 2000 ? 'text-green-600' : 'text-red-600'}`}>
                  {loadMetrics.firstContentfulPaint < 2000 ? 'Good' : 'Needs Work'}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatTime(loadMetrics.firstContentfulPaint)}
              </div>
              <div className="text-sm text-gray-600">First Contentful Paint</div>
            </div>

            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span className={`text-sm ${loadMetrics.largestContentfulPaint < 4000 ? 'text-green-600' : 'text-red-600'}`}>
                  {loadMetrics.largestContentfulPaint < 4000 ? 'Good' : 'Needs Work'}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatTime(loadMetrics.largestContentfulPaint)}
              </div>
              <div className="text-sm text-gray-600">Largest Contentful Paint</div>
            </div>

            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-5 h-5 text-green-600" />
                <span className={`text-sm ${loadMetrics.domContentLoaded < 1000 ? 'text-green-600' : 'text-red-600'}`}>
                  {loadMetrics.domContentLoaded < 1000 ? 'Good' : 'Needs Work'}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatTime(loadMetrics.domContentLoaded)}
              </div>
              <div className="text-sm text-gray-600">DOM Content Loaded</div>
            </div>

            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <Database className="w-5 h-5 text-purple-600" />
                <span className={`text-sm ${memoryInfo?.usedJSHeapSize < 50 * 1024 * 1024 ? 'text-green-600' : 'text-red-600'}`}>
                  {memoryInfo?.usedJSHeapSize < 50 * 1024 * 1024 ? 'Good' : 'High'}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatBytes(memoryInfo?.usedJSHeapSize)}
              </div>
              <div className="text-sm text-gray-600">Memory Usage</div>
            </div>
          </div>

          {/* Detailed Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Memory Information */}
            {memoryInfo && (
              <div className="bg-white rounded-lg border p-6">
                <h4 className="font-semibold mb-4 flex items-center">
                  <Database className="w-5 h-5 mr-2 text-purple-600" />
                  Memory Information
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Used JS Heap Size:</span>
                    <span className="font-semibold">{formatBytes(memoryInfo.usedJSHeapSize)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total JS Heap Size:</span>
                    <span className="font-semibold">{formatBytes(memoryInfo.totalJSHeapSize)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">JS Heap Size Limit:</span>
                    <span className="font-semibold">{formatBytes(memoryInfo.jsHeapSizeLimit)}</span>
                  </div>
                  <div className="mt-3">
                    <div className="text-sm text-gray-600 mb-1">Memory Usage</div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ 
                          width: `${Math.min(100, (memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize) * 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Network Information */}
            {connectionInfo && (
              <div className="bg-white rounded-lg border p-6">
                <h4 className="font-semibold mb-4 flex items-center">
                  <Wifi className="w-5 h-5 mr-2 text-blue-600" />
                  Network Information
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Connection Type:</span>
                    <span className="font-semibold">{connectionInfo.effectiveType || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Download Speed:</span>
                    <span className="font-semibold">{connectionInfo.downlink || 'Unknown'} Mbps</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Round Trip Time:</span>
                    <span className="font-semibold">{connectionInfo.rtt || 'Unknown'} ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Data Saver:</span>
                    <span className={`font-semibold ${connectionInfo.saveData ? 'text-green-600' : 'text-gray-600'}`}>
                      {connectionInfo.saveData ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Device Information */}
            {deviceInfo && (
              <div className="bg-white rounded-lg border p-6">
                <h4 className="font-semibold mb-4 flex items-center">
                  <Monitor className="w-5 h-5 mr-2 text-green-600" />
                  Device Information
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Platform:</span>
                    <span className="font-semibold">{deviceInfo.platform}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Screen Resolution:</span>
                    <span className="font-semibold">{deviceInfo.screenWidth} × {deviceInfo.screenHeight}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Color Depth:</span>
                    <span className="font-semibold">{deviceInfo.colorDepth} bit</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Online Status:</span>
                    <span className={`font-semibold flex items-center ${deviceInfo.onLine ? 'text-green-600' : 'text-red-600'}`}>
                      {deviceInfo.onLine ? <CheckCircle className="w-4 h-4 mr-1" /> : <AlertTriangle className="w-4 h-4 mr-1" />}
                      {deviceInfo.onLine ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div className="bg-white rounded-lg border p-6">
              <h4 className="font-semibold mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-orange-600" />
                Performance Recommendations
              </h4>
              <div className="space-y-3">
                {loadMetrics.firstContentfulPaint > 2000 && (
                  <div className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">Consider optimizing initial render performance</span>
                  </div>
                )}
                {memoryInfo?.usedJSHeapSize > 50 * 1024 * 1024 && (
                  <div className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">High memory usage detected - consider code splitting</span>
                  </div>
                )}
                {connectionInfo?.downlink < 1 && (
                  <div className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">Slow network detected - enable data saving features</span>
                  </div>
                )}
                {performanceScore >= 90 && (
                  <div className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">Excellent performance! Keep up the good work.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;