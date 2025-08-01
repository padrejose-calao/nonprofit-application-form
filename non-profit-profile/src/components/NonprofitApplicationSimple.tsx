import React, { useState } from 'react';
import { User as UserType } from '../services/api';

interface NonprofitApplicationProps {
  currentUser: UserType | null;
  onLogout: () => void;
}

const NonprofitApplicationSimple: React.FC<NonprofitApplicationProps> = ({ currentUser, onLogout }) => {
  console.log('NonprofitApplicationSimple component rendering');
  
  const [activeTab, setActiveTab] = useState<string>('basicInfo');
  
  if (!currentUser) {
    return <div>No user provided</div>;
  }
  
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <header style={{ backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '16px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>CALAO Nonprofit Application</h1>
        <p>User: {currentUser.name}</p>
      </header>
      
      <div style={{ display: 'flex' }}>
        {/* Sidebar */}
        <div style={{ width: '256px', backgroundColor: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', height: '100vh', padding: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Navigation</h2>
          <nav>
            <button 
              onClick={() => setActiveTab('basicInfo')}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '8px',
                marginBottom: '8px',
                borderRadius: '4px',
                backgroundColor: activeTab === 'basicInfo' ? '#3b82f6' : '#f3f4f6',
                color: activeTab === 'basicInfo' ? 'white' : 'black',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Basic Information
            </button>
            <button 
              onClick={() => setActiveTab('narrative')}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '8px',
                marginBottom: '8px',
                borderRadius: '4px',
                backgroundColor: activeTab === 'narrative' ? '#3b82f6' : '#f3f4f6',
                color: activeTab === 'narrative' ? 'white' : 'black',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Narrative
            </button>
            <button 
              onClick={() => setActiveTab('governance')}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '8px',
                marginBottom: '8px',
                borderRadius: '4px',
                backgroundColor: activeTab === 'governance' ? '#3b82f6' : '#f3f4f6',
                color: activeTab === 'governance' ? 'white' : 'black',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Governance
            </button>
          </nav>
        </div>
        
        {/* Main Content */}
        <div style={{ flex: 1, padding: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Active Section: {activeTab}</h2>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <p>Content for {activeTab} section will go here.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NonprofitApplicationSimple;