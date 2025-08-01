import React, { useState } from 'react';
import { User as UserType } from '../services/api';

interface NonprofitApplicationProps {
  currentUser: UserType | null;
  onLogout: () => void;
}

const NonprofitApplicationMinimal: React.FC<NonprofitApplicationProps> = ({ currentUser, onLogout }) => {
  console.log('NonprofitApplicationMinimal rendering');
  
  const [formData, setFormData] = useState({
    organizationName: '',
    ein: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    website: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: 'white', 
        padding: '1rem 2rem',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
          CALAO Nonprofit Application
        </h1>
        <div>
          <span style={{ marginRight: '1rem' }}>User: {currentUser?.name}</span>
          <button 
            onClick={onLogout}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
            Basic Information
          </h2>

          <form>
            {/* Organization Name */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>
                Organization Name *
              </label>
              <input
                type="text"
                value={formData.organizationName}
                onChange={(e) => handleInputChange('organizationName', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
                placeholder="Enter organization name"
              />
            </div>

            {/* EIN */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>
                EIN (Employer Identification Number)
              </label>
              <input
                type="text"
                value={formData.ein}
                onChange={(e) => handleInputChange('ein', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
                placeholder="XX-XXXXXXX"
                maxLength={10}
              />
            </div>

            {/* Address */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>
                Street Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
                placeholder="Enter street address"
              />
            </div>

            {/* City, State, Zip in a row */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ flex: 2 }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '1rem'
                  }}
                  placeholder="Enter city"
                />
              </div>
              
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>
                  State
                </label>
                <select
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '1rem'
                  }}
                >
                  <option value="">Select</option>
                  <option value="FL">FL</option>
                  <option value="IL">IL</option>
                  <option value="PA">PA</option>
                  <option value="PR">PR</option>
                  <option value="TX">TX</option>
                </select>
              </div>
              
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>
                  Zip Code
                </label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '1rem'
                  }}
                  placeholder="12345"
                  maxLength={5}
                />
              </div>
            </div>

            {/* Phone */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
                placeholder="(123) 456-7890"
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
                placeholder="info@organization.org"
              />
            </div>

            {/* Submit Button */}
            <div style={{ marginTop: '2rem' }}>
              <button
                type="submit"
                style={{
                  padding: '0.75rem 2rem',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
                onClick={(e) => {
                  e.preventDefault();
                  console.log('Form data:', formData);
                  alert('Form submitted! Check console for data.');
                }}
              >
                Save Information
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NonprofitApplicationMinimal;