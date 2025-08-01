import React from 'react';

interface User {
  id: number;
  email: string;
  name: string;
  organization?: string;
  role: 'user' | 'admin' | 'reviewer';
  createdAt?: string;
  lastLogin?: string;
}

interface NonprofitApplicationProps {
  currentUser: User;
  onLogout: () => void;
}

const NonprofitApplicationTest: React.FC<NonprofitApplicationProps> = ({ currentUser, onLogout }) => {
  console.log('NonprofitApplicationTest rendering...', currentUser);
  
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>🎉 React App Working!</h1>
      <p>Welcome, {currentUser.name}!</p>
      <p>Organization: {currentUser.organization || 'No organization'}</p>
      <p>If you can see this, React is mounting correctly.</p>
      <button onClick={onLogout} style={{ padding: '10px 20px', marginTop: '20px' }}>
        Test Button
      </button>
    </div>
  );
};

export default NonprofitApplicationTest;