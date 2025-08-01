import React from 'react';
import { Building2, Users, Calendar, Award } from 'lucide-react';

interface BoardMemberDetailsSectionProps {
  formData: any;
  errors: any;
  locked: boolean;
  onInputChange: (field: string, value: any) => void;
  onFileUpload?: (field: string, file: File) => void;
}

const BoardMemberDetailsSection: React.FC<BoardMemberDetailsSectionProps> = ({
  formData,
  errors,
  locked,
  onInputChange,
  onFileUpload
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Building2 className="w-5 h-5 mr-2" />
          Board Member Details
        </h3>
        <p className="text-gray-600">
          Detailed board member information is managed in the Governance section. 
          Use the Contact Manager to add and manage board member profiles, then 
          assign them to the board in the Governance section.
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center py-8">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-800 mb-2">Board Member Management</h4>
          <p className="text-gray-600 mb-4">
            Board member details are integrated with the main Governance section. 
            Navigate to the Governance section to:
          </p>
          <ul className="text-sm text-gray-600 space-y-1 mb-4">
            <li>• Add and manage board members</li>
            <li>• Track board composition and terms</li>
            <li>• Record meeting attendance</li>
            <li>• Manage committees and roles</li>
          </ul>
          <p className="text-sm text-gray-500">
            This section exists for compatibility but board management is handled in Governance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BoardMemberDetailsSection;