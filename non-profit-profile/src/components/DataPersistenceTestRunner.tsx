import React, { useState } from 'react';
import { runDataPersistenceTests } from '../utils/testDataPersistence';
import { CheckCircle, XCircle, AlertCircle, Play, FileText } from 'lucide-react';
import { logger } from '../utils/logger';

interface TestResult {
  service: string;
  operation: string;
  success: boolean;
  error?: string;
  details?: unknown;
}

const DataPersistenceTestRunner: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);
    
    try {
      const testResults = await runDataPersistenceTests();
      setResults(testResults);
    } catch (error) {
      logger.error('Test runner error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const toggleDetails = (index: number) => {
    setShowDetails(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const getStats = () => {
    const total = results.length;
    const passed = results.filter(r => r.success).length;
    const failed = total - passed;
    const rate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
    
    return { total, passed, failed, rate };
  };

  const { total, passed, failed, rate } = getStats();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Data Persistence Test Runner
          </h2>
          <p className="text-gray-600 mt-2">
            Test end-to-end data persistence with Netlify storage services
          </p>
        </div>

        <div className="p-6">
          <button
            onClick={runTests}
            disabled={isRunning}
            className={`
              px-6 py-3 rounded-lg font-medium flex items-center gap-2
              ${isRunning 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-green-600 text-white hover:bg-green-700'
              }
            `}
          >
            <Play className="h-4 w-4" />
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </button>

          {results.length > 0 && (
            <>
              <div className="mt-6 grid grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-700">{total}</div>
                  <div className="text-sm text-blue-600">Total Tests</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-700">{passed}</div>
                  <div className="text-sm text-green-600">Passed</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-red-700">{failed}</div>
                  <div className="text-sm text-red-600">Failed</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-700">{rate}%</div>
                  <div className="text-sm text-purple-600">Success Rate</div>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <h3 className="text-lg font-semibold text-gray-800">Test Results:</h3>
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`
                      border rounded-lg p-4
                      ${result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {result.success ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <div>
                          <span className="font-medium text-gray-800">
                            {result.service}
                          </span>
                          <span className="text-gray-600 mx-2">→</span>
                          <span className="text-gray-700">
                            {result.operation}
                          </span>
                        </div>
                      </div>
                      
                      {(result.details || result.error) && (
                        <button
                          onClick={() => toggleDetails(index)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          {showDetails[index] ? 'Hide' : 'Show'} Details
                        </button>
                      )}
                    </div>

                    {showDetails[index] && (
                      <div className="mt-3 pl-8">
                        <>
                          {result.error && (
                            <div className="text-red-600 text-sm">
                              <strong>Error:</strong> {result.error}
                            </div>
                          )}
                          {result.details && (
                            <div className="text-gray-600 text-sm">
                              <strong>Details:</strong>
                              <pre className="mt-1 bg-white p-2 rounded border border-gray-200 overflow-x-auto">
                                {JSON.stringify(result.details, null, 2)}
                              </pre>
                            </div>
                          )}
                        </>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {!isRunning && results.length === 0 && (
            <div className="mt-6 text-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">
                Click "Run All Tests" to start testing data persistence
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataPersistenceTestRunner;