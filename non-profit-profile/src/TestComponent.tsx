import React from 'react';
import { logger } from './utils/logger';

const TestComponent: React.FC = () => {
  logger.debug('TestComponent rendering');
  return (
    <div style={{ padding: '20px', textAlign: 'center', backgroundColor: 'lightblue' }}>
      <h1>Test Component Works!</h1>
      <p>If you can see this, React is working properly.</p>
    </div>
  );
};

export default TestComponent;