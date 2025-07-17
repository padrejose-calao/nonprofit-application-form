import React from 'react';
import { SectionProps } from '../types';

const OrganizationIdentitySection: React.FC<SectionProps> = ({ data, onChange, errors }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Organization Identity</h2>
      <p className="text-gray-600">Section under development...</p>
    </div>
  );
};

export default OrganizationIdentitySection;