import React from 'react';
import { logger } from './utils/logger';

const Debug: React.FC = () => {
  logger.debug('Debug component rendering');
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1 style={{ color: '#333', fontSize: '24px' }}>Debug Component</h1>
      <p style={{ color: '#666' }}>If you can see this, React is working!</p>
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: 'white', border: '1px solid #ccc' }}>
        <h2 style={{ fontSize: '18px' }}>Tailwind CSS Test</h2>
        <p className="text-blue-600 font-bold">This text should be blue and bold if Tailwind is working</p>
        <button className="bg-blue-500 text-white px-4 py-2 rounded mt-2">
          Tailwind Button
        </button>
      </div>
    </div>
  );
};

export default Debug;