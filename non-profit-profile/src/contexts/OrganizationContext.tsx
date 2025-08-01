import React, { createContext, useContext, useState, ReactNode } from 'react';

interface OrganizationContextType {
  organizationId: string;
  setOrganizationId: (id: string) => void;
  organizationName: string;
  setOrganizationName: (name: string) => void;
  organizationEIN: string;
  setOrganizationEIN: (ein: string) => void;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const OrganizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [organizationId, setOrganizationId] = useState<string>('');
  const [organizationName, setOrganizationName] = useState<string>('');
  const [organizationEIN, setOrganizationEIN] = useState<string>('');

  return (
    <OrganizationContext.Provider 
      value={{
        organizationId,
        setOrganizationId,
        organizationName,
        setOrganizationName,
        organizationEIN,
        setOrganizationEIN
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};