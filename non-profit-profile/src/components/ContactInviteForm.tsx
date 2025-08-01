import React, { useCallback, useState, useEffect } from 'react';
import {
  User, Mail, Phone, Building2, Briefcase, Camera,
  Upload, Save, Check, AlertCircle, Globe, MapPin,
  Calendar, Award, Link2, Linkedin, Twitter
} from 'lucide-react';
import { toast } from 'react-toastify';
import { storageService } from '../services/storageService';

interface ContactInviteData {
  // Personal Info
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  phone: string;
  
  // Professional Info
  organization: string;
  department: string;
  role: 'board_member' | 'staff' | 'volunteer' | 'donor' | 'partner';
  startDate: string;
  
  // Address
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  
  // Bio & Social
  bio: string;
  expertise: string[];
  linkedin?: string;
  twitter?: string;
  website?: string;
  
  // Board Specific
  boardPosition?: string;
  committees?: string[];
  termEndDate?: string;
  
  // Photo
  photoUrl?: string;
  photoFile?: File;
}

interface ContactInviteFormProps {
  inviteCode: string;
  organizationName: string;
  inviterName: string;
}

const ContactInviteForm: React.FC<ContactInviteFormProps> = ({
  inviteCode,
  organizationName,
  inviterName
}) => {
  const [formData, setFormData] = useState<ContactInviteData>({
    firstName: '',
    lastName: '',
    title: '',
    email: '',
    phone: '',
    organization: organizationName,
    department: '',
    role: 'staff',
    startDate: '',
    bio: '',
    expertise: [],
    boardPosition: '',
    committees: [],
    termEndDate: ''
  });
  
  const [errors, setErrors] = useState<Partial<ContactInviteData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [currentStep, setCurrentStep] = useState(0);

  const expertiseOptions = [
    'Finance', 'Legal', 'Marketing', 'Technology', 'Healthcare',
    'Education', 'Fundraising', 'Governance', 'Strategic Planning',
    'Human Resources', 'Public Relations', 'Operations'
  ];

  const boardPositions = [
    'Chair', 'Vice Chair', 'Secretary', 'Treasurer', 
    'Member', 'Executive Committee', 'Advisory Board'
  ];

  const committees = [
    'Executive', 'Finance', 'Audit', 'Governance', 
    'Development', 'Programs', 'Marketing', 'Nominating'
  ];

  useEffect(() => {
    // Verify invite code
    const verifyInvite = async () => {
      const storedInvites = (await storageService.get('contactInvites')) || {};
      if (!storedInvites[inviteCode]) {
        toast.error('Invalid or expired invite code');
        window.location.href = '/';
      }
    };
    verifyInvite();
  }, [inviteCode]);

  const handlePhotoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Photo must be less than 5MB');
        return;
      }
      
      setFormData(prev => ({ ...prev, photoFile: file }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const validateForm = (): boolean => {
    const newErrors: any = {};
    
    if (!formData.firstName) newErrors.firstName = 'Required';
    if (!formData.lastName) newErrors.lastName = 'Required';
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Valid email required';
    }
    if (!formData.phone) newErrors.phone = 'Required';
    if (!formData.title) newErrors.title = 'Required';
    if (formData.bio.length < 50) newErrors.bio = 'Minimum 50 characters';
    
    if (formData.role === 'board_member') {
      if (!formData.boardPosition) newErrors.boardPosition = 'Required for board members';
      if (!formData.termEndDate) newErrors.termEndDate = 'Required for board members';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please complete all required fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Save contact data
      const contacts = (await storageService.get('invitedContacts')) || [];
      const newContact = {
        ...formData,
        inviteCode,
        submittedAt: new Date().toISOString(),
        status: 'pending_approval',
        id: Date.now().toString()
      };
      
      contacts.push(newContact);
      await storageService.set('invitedContacts', contacts);
      
      // Mark invite as used
      const invites = (await storageService.get('contactInvites')) || {};
      invites[inviteCode].used = true;
      invites[inviteCode].usedAt = new Date().toISOString();
      await storageService.set('contactInvites', invites);
      
      toast.success('Profile submitted successfully!');
      
      setTimeout(() => {
        setCurrentStep(3); // Show success screen
      }, 1000);
      
    } catch (error) {
      toast.error('Error submitting profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof ContactInviteData]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const toggleExpertise = (expertise: string) => {
    setFormData(prev => ({
      ...prev,
      expertise: prev.expertise?.includes(expertise)
        ? prev.expertise.filter(e => e !== expertise)
        : [...(prev.expertise || []), expertise]
    }));
  };

  const toggleCommittee = (committee: string) => {
    setFormData(prev => ({
      ...prev,
      committees: prev.committees?.includes(committee)
        ? prev.committees.filter(c => c !== committee)
        : [...(prev.committees || []), committee]
    }));
  };

  if (currentStep === 3) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-600 mb-6">
            Your profile has been submitted successfully. {organizationName} will review 
            your information and add it to their profile.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Personal Info
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="relative inline-block">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                    <Camera className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700">
                  <Upload className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-sm text-gray-500 mt-2">Upload your photo (optional)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => updateFormData('firstName', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.firstName ? 'border-red-500' : ''
                  }`}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => updateFormData('lastName', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.lastName ? 'border-red-500' : ''
                  }`}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title/Position *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateFormData('title', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-red-500' : ''
                }`}
                placeholder="e.g., Executive Director, Board Member"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? 'border-red-500' : ''
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.phone ? 'border-red-500' : ''
                  }`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) => updateFormData('role', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="board_member">Board Member</option>
                <option value="staff">Staff</option>
                <option value="volunteer">Volunteer</option>
                <option value="donor">Donor</option>
                <option value="partner">Partner</option>
              </select>
            </div>
          </div>
        );

      case 1: // Professional Info
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio * (minimum 50 characters)
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => updateFormData('bio', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.bio ? 'border-red-500' : ''
                }`}
                rows={4}
                placeholder="Tell us about yourself, your background, and your connection to the organization..."
              />
              <div className="text-sm text-gray-500 mt-1">
                {formData.bio.length}/50 characters
              </div>
              {errors.bio && (
                <p className="text-red-500 text-sm">{errors.bio}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Areas of Expertise
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {expertiseOptions.map(exp => (
                  <label key={exp} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.expertise?.includes(exp) || false}
                      onChange={() => toggleExpertise(exp)}
                      className="rounded text-blue-600"
                    />
                    <span className="text-sm">{exp}</span>
                  </label>
                ))}
              </div>
            </div>

            {formData.role === 'board_member' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Board Position *
                  </label>
                  <select
                    value={formData.boardPosition}
                    onChange={(e) => updateFormData('boardPosition', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.boardPosition ? 'border-red-500' : ''
                    }`}
                  >
                    <option value="">Select position</option>
                    {boardPositions.map(pos => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                  {errors.boardPosition && (
                    <p className="text-red-500 text-sm mt-1">{errors.boardPosition}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Committee Memberships
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {committees.map(comm => (
                      <label key={comm} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.committees?.includes(comm) || false}
                          onChange={() => toggleCommittee(comm)}
                          className="rounded text-blue-600"
                        />
                        <span className="text-sm">{comm}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => updateFormData('startDate', e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Term End Date *
                    </label>
                    <input
                      type="date"
                      value={formData.termEndDate}
                      onChange={(e) => updateFormData('termEndDate', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.termEndDate ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.termEndDate && (
                      <p className="text-red-500 text-sm mt-1">{errors.termEndDate}</p>
                    )}
                  </div>
                </div>
              </>
            )}

            <div className="space-y-4">
              <h4 className="font-medium">Social & Professional Links (optional)</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  LinkedIn Profile
                </label>
                <div className="flex items-center">
                  <Linkedin className="w-5 h-5 text-gray-400 mr-2" />
                  <input
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => updateFormData('linkedin', e.target.value)}
                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Twitter/X
                </label>
                <div className="flex items-center">
                  <Twitter className="w-5 h-5 text-gray-400 mr-2" />
                  <input
                    type="text"
                    value={formData.twitter}
                    onChange={(e) => updateFormData('twitter', e.target.value)}
                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="@username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Personal Website
                </label>
                <div className="flex items-center">
                  <Globe className="w-5 h-5 text-gray-400 mr-2" />
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => updateFormData('website', e.target.value)}
                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2: // Review
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              {photoPreview && (
                <img
                  src={photoPreview}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
                />
              )}
              <h3 className="text-xl font-semibold">
                {formData.firstName} {formData.lastName}
              </h3>
              <p className="text-gray-600">{formData.title}</p>
              <p className="text-sm text-gray-500">{formData.role.replace('_', ' ').toUpperCase()}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                <p className="text-sm text-gray-700">{formData.email}</p>
                <p className="text-sm text-gray-700">{formData.phone}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Bio</h4>
                <p className="text-sm text-gray-700">{formData.bio}</p>
              </div>

              {formData.expertise.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Expertise</h4>
                  <div className="flex flex-wrap gap-2">
                    {formData.expertise.map(exp => (
                      <span key={exp} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {exp}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {formData.role === 'board_member' && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Board Information</h4>
                  <p className="text-sm text-gray-700">Position: {formData.boardPosition}</p>
                  {formData.committees && formData.committees.length > 0 && (
                    <p className="text-sm text-gray-700">
                      Committees: {formData.committees.join(', ')}
                    </p>
                  )}
                  <p className="text-sm text-gray-700">Term ends: {formData.termEndDate}</p>
                </div>
              )}

              {(formData.linkedin || formData.twitter || formData.website) && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Links</h4>
                  {formData.linkedin && (
                    <p className="text-sm text-gray-700">LinkedIn: {formData.linkedin}</p>
                  )}
                  {formData.twitter && (
                    <p className="text-sm text-gray-700">Twitter: {formData.twitter}</p>
                  )}
                  {formData.website && (
                    <p className="text-sm text-gray-700">Website: {formData.website}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Your Profile
          </h1>
          <p className="text-gray-600">
            {inviterName} from {organizationName} has invited you to create your profile
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {['Personal', 'Professional', 'Review'].map((step, index) => (
              <div key={step} className="flex-1 text-center">
                <div
                  className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center ${
                    index <= currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {index < currentStep ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <p className="text-sm">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {renderStepContent()}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Previous
              </button>
            )}

            {currentStep < 2 ? (
              <button
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="ml-auto px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Profile'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInviteForm;