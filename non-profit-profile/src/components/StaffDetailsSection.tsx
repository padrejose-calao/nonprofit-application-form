import React from 'react';
import { Users, Briefcase, Award, TrendingUp } from 'lucide-react';

interface StaffDetailsSectionProps {
  formData: any;
  errors: any;
  locked: boolean;
  onInputChange: (field: string, value: any) => void;
  onFileUpload?: (field: string, file: File) => void;
}

const StaffDetailsSection: React.FC<StaffDetailsSectionProps> = ({
  formData,
  errors,
  locked,
  onInputChange,
  onFileUpload
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-green-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Staff Details
        </h3>
        <p className="text-gray-600">
          Detailed staff information is managed in the Management section. 
          Navigate to the Management section to add staff members, track 
          salaries, and manage HR information.
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center py-8">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-800 mb-2">Staff Management</h4>
          <p className="text-gray-600 mb-4">
            Staff details are integrated with the main Management section. 
            Navigate to the Management section to:
          </p>
          <ul className="text-sm text-gray-600 space-y-1 mb-4">
            <li>• Add and manage staff members</li>
            <li>• Track salaries and benefits</li>
            <li>• Record HR policies</li>
            <li>• Manage organizational structure</li>
          </ul>
          <p className="text-sm text-gray-500">
            This section exists for compatibility but staff management is handled in Management.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StaffDetailsSection;