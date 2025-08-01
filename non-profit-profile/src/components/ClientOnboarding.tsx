import React, { useState } from 'react';
import {
  Building2, Mail, Phone, MapPin, Users, Calendar,
  Globe, FileText, Save, ChevronRight, ChevronLeft,
  Check, AlertCircle, Upload, Link, Send, RefreshCw
} from 'lucide-react';
import { toast } from 'react-toastify';
import { netlifySettingsService } from '../services/netlifySettingsService';

interface OnboardingData {
  // Basic Info
  organizationName: string;
  ein: string;
  yearFounded: string;
  website: string;
  
  // Contact
  contactName: string;
  contactTitle: string;
  contactEmail: string;
  contactPhone: string;
  
  // Address
  street: string;
  city: string;
  state: string;
  zipCode: string;
  
  // Mission
  missionStatement: string;
  primaryService: string;
  targetPopulation: string;
  
  // Board
  boardSize: number;
  boardChairName: string;
  boardChairEmail: string;
  
  // Programs
  mainPrograms: string[];
  annualBudget: string;
  
  // Documents
  logo?: File;
  additionalDocs?: File[];
}

const ClientOnboarding: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<OnboardingData>({
    organizationName: '',
    ein: '',
    yearFounded: '',
    website: '',
    contactName: '',
    contactTitle: '',
    contactEmail: '',
    contactPhone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    missionStatement: '',
    primaryService: '',
    targetPopulation: '',
    boardSize: 3,
    boardChairName: '',
    boardChairEmail: '',
    mainPrograms: [''],
    annualBudget: ''
  });
  
  const [errors, setErrors] = useState<Partial<OnboardingData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = [
    { id: 'basic', title: 'Basic Information', icon: Building2 },
    { id: 'contact', title: 'Contact Details', icon: Phone },
    { id: 'mission', title: 'Mission & Services', icon: FileText },
    { id: 'governance', title: 'Governance', icon: Users },
    { id: 'review', title: 'Review & Submit', icon: Check }
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (step) {
      case 0: // Basic Info
        if (!formData.organizationName) newErrors.organizationName = 'Required';
        if (!formData.ein || !/^\d{2}-\d{7}$/.test(formData.ein)) {
          newErrors.ein = 'Format: XX-XXXXXXX';
        }
        if (!formData.yearFounded || parseInt(formData.yearFounded) > new Date().getFullYear()) {
          newErrors.yearFounded = 'Invalid year';
        }
        break;
        
      case 1: // Contact
        if (!formData.contactName) newErrors.contactName = 'Required';
        if (!formData.contactEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
          newErrors.contactEmail = 'Invalid email';
        }
        if (!formData.contactPhone) newErrors.contactPhone = 'Required';
        if (!formData.street) newErrors.street = 'Required';
        if (!formData.city) newErrors.city = 'Required';
        if (!formData.state) newErrors.state = 'Required';
        if (!formData.zipCode) newErrors.zipCode = 'Required';
        break;
        
      case 2: // Mission
        if (!formData.missionStatement || formData.missionStatement.length < 50) {
          newErrors.missionStatement = 'At least 50 characters';
        }
        if (!formData.primaryService) newErrors.primaryService = 'Required';
        if (!formData.targetPopulation) newErrors.targetPopulation = 'Required';
        break;
        
      case 3: // Governance
        if (formData.boardSize < 3) newErrors.boardSize = 'Minimum 3 members';
        if (!formData.boardChairName) newErrors.boardChairName = 'Required';
        if (!formData.boardChairEmail) newErrors.boardChairEmail = 'Required';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    } else {
      toast.error('Please complete all required fields');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      toast.error('Please complete all required fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Generate unique profile code
      const profileCode = `${formData.ein.replace('-', '')}-${Date.now().toString(36).toUpperCase()}`;
      
      // Save to Netlify
      const profiles = ((await netlifySettingsService.get('onboardedProfiles')) as any[]) || [];
      profiles.push({
        ...formData,
        profileCode,
        submittedAt: new Date().toISOString(),
        status: 'pending_review'
      });
      await netlifySettingsService.set('onboardedProfiles', profiles, 'organization');
      
      toast.success('Profile submitted successfully!');
      
      // Show success message with profile code
      setTimeout(() => {
        alert(`Your profile has been submitted for review.\n\nYour Profile Code: ${profileCode}\n\nPlease save this code for future reference.`);
        // Reset form
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      toast.error('Error submitting profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field as keyof OnboardingData]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const addProgram = () => {
    setFormData(prev => ({
      ...prev,
      mainPrograms: [...prev.mainPrograms, '']
    }));
  };

  const updateProgram = (index: number, value: string) => {
    const updated = [...formData.mainPrograms];
    updated[index] = value;
    setFormData(prev => ({ ...prev, mainPrograms: updated }));
  };

  const removeProgram = (index: number) => {
    if (formData.mainPrograms.length > 1) {
      const updated = formData.mainPrograms.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, mainPrograms: updated }));
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basic Info
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">Tell us about your organization</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organization Name *
              </label>
              <input
                type="text"
                value={formData.organizationName}
                onChange={(e) => updateFormData('organizationName', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.organizationName ? 'border-red-500' : ''
                }`}
                placeholder="Enter your organization's legal name"
              />
              {errors.organizationName && (
                <p className="text-red-500 text-sm mt-1">{errors.organizationName}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  EIN (Tax ID) *
                </label>
                <input
                  type="text"
                  value={formData.ein}
                  onChange={(e) => updateFormData('ein', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.ein ? 'border-red-500' : ''
                  }`}
                  placeholder="XX-XXXXXXX"
                />
                {errors.ein && (
                  <p className="text-red-500 text-sm mt-1">{errors.ein}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year Founded *
                </label>
                <input
                  type="number"
                  value={formData.yearFounded}
                  onChange={(e) => updateFormData('yearFounded', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.yearFounded ? 'border-red-500' : ''
                  }`}
                  placeholder="YYYY"
                  max={new Date().getFullYear()}
                />
                {errors.yearFounded && (
                  <p className="text-red-500 text-sm mt-1">{errors.yearFounded}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website (optional)
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => updateFormData('website', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="https://www.example.org"
              />
            </div>
          </div>
        );

      case 1: // Contact Details
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Name *
                </label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => updateFormData('contactName', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.contactName ? 'border-red-500' : ''
                  }`}
                  placeholder="Full name"
                />
                {errors.contactName && (
                  <p className="text-red-500 text-sm mt-1">{errors.contactName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title/Position *
                </label>
                <input
                  type="text"
                  value={formData.contactTitle}
                  onChange={(e) => updateFormData('contactTitle', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Executive Director"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => updateFormData('contactEmail', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.contactEmail ? 'border-red-500' : ''
                  }`}
                  placeholder="email@example.org"
                />
                {errors.contactEmail && (
                  <p className="text-red-500 text-sm mt-1">{errors.contactEmail}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => updateFormData('contactPhone', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.contactPhone ? 'border-red-500' : ''
                  }`}
                  placeholder="(555) 123-4567"
                />
                {errors.contactPhone && (
                  <p className="text-red-500 text-sm mt-1">{errors.contactPhone}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Organization Address</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) => updateFormData('street', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.street ? 'border-red-500' : ''
                  }`}
                  placeholder="123 Main Street"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => updateFormData('city', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.city ? 'border-red-500' : ''
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => updateFormData('state', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.state ? 'border-red-500' : ''
                    }`}
                    maxLength={2}
                    placeholder="XX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => updateFormData('zipCode', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.zipCode ? 'border-red-500' : ''
                    }`}
                    placeholder="12345"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2: // Mission & Services
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">Mission & Services</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mission Statement * (minimum 50 characters)
              </label>
              <textarea
                value={formData.missionStatement}
                onChange={(e) => updateFormData('missionStatement', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.missionStatement ? 'border-red-500' : ''
                }`}
                rows={4}
                placeholder="Describe your organization's mission and purpose..."
              />
              <div className="text-sm text-gray-500 mt-1">
                {formData.missionStatement.length}/50 characters
              </div>
              {errors.missionStatement && (
                <p className="text-red-500 text-sm">{errors.missionStatement}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Primary Service Area *
              </label>
              <select
                value={formData.primaryService}
                onChange={(e) => updateFormData('primaryService', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.primaryService ? 'border-red-500' : ''
                }`}
              >
                <option value="">Select primary service</option>
                <option value="education">Education</option>
                <option value="health">Health Services</option>
                <option value="social">Social Services</option>
                <option value="arts">Arts & Culture</option>
                <option value="environment">Environment</option>
                <option value="youth">Youth Development</option>
                <option value="community">Community Development</option>
                <option value="other">Other</option>
              </select>
              {errors.primaryService && (
                <p className="text-red-500 text-sm mt-1">{errors.primaryService}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Population *
              </label>
              <input
                type="text"
                value={formData.targetPopulation}
                onChange={(e) => updateFormData('targetPopulation', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.targetPopulation ? 'border-red-500' : ''
                }`}
                placeholder="e.g., Low-income families, Youth ages 12-18, Seniors"
              />
              {errors.targetPopulation && (
                <p className="text-red-500 text-sm mt-1">{errors.targetPopulation}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Main Programs/Services
              </label>
              {formData.mainPrograms.map((program, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={program}
                    onChange={(e) => updateProgram(index, e.target.value)}
                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Program name"
                  />
                  {formData.mainPrograms.length > 1 && (
                    <button
                      onClick={() => removeProgram(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addProgram}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                + Add another program
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Annual Operating Budget (optional)
              </label>
              <select
                value={formData.annualBudget}
                onChange={(e) => updateFormData('annualBudget', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select budget range</option>
                <option value="under-50k">Under $50,000</option>
                <option value="50k-250k">$50,000 - $250,000</option>
                <option value="250k-1m">$250,000 - $1 million</option>
                <option value="1m-5m">$1 million - $5 million</option>
                <option value="over-5m">Over $5 million</option>
              </select>
            </div>
          </div>
        );

      case 3: // Governance
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">Governance Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Board Members *
              </label>
              <input
                type="number"
                value={formData.boardSize}
                onChange={(e) => updateFormData('boardSize', parseInt(e.target.value) || 0)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.boardSize ? 'border-red-500' : ''
                }`}
                min={3}
                placeholder="Minimum 3"
              />
              {errors.boardSize && (
                <p className="text-red-500 text-sm mt-1">{errors.boardSize}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                IRS requires at least 3 board members for 501(c)(3) organizations
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Board Chair Information</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Board Chair Name *
                </label>
                <input
                  type="text"
                  value={formData.boardChairName}
                  onChange={(e) => updateFormData('boardChairName', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.boardChairName ? 'border-red-500' : ''
                  }`}
                  placeholder="Full name"
                />
                {errors.boardChairName && (
                  <p className="text-red-500 text-sm mt-1">{errors.boardChairName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Board Chair Email *
                </label>
                <input
                  type="email"
                  value={formData.boardChairEmail}
                  onChange={(e) => updateFormData('boardChairEmail', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.boardChairEmail ? 'border-red-500' : ''
                  }`}
                  placeholder="chair@example.org"
                />
                {errors.boardChairEmail && (
                  <p className="text-red-500 text-sm mt-1">{errors.boardChairEmail}</p>
                )}
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-600" />
                Board Member Invitations
              </h4>
              <p className="text-sm text-gray-700">
                After your profile is approved, you'll be able to send invitations to board members 
                to complete their profiles directly.
              </p>
            </div>
          </div>
        );

      case 4: // Review
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">Review Your Information</h3>
            
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Organization</h4>
                <p className="text-gray-700">{formData.organizationName}</p>
                <p className="text-sm text-gray-500">EIN: {formData.ein}</p>
                <p className="text-sm text-gray-500">Founded: {formData.yearFounded}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Contact</h4>
                <p className="text-gray-700">{formData.contactName}, {formData.contactTitle}</p>
                <p className="text-sm text-gray-500">{formData.contactEmail}</p>
                <p className="text-sm text-gray-500">{formData.contactPhone}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Address</h4>
                <p className="text-gray-700">
                  {formData.street}<br />
                  {formData.city}, {formData.state} {formData.zipCode}
                </p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Mission</h4>
                <p className="text-gray-700 text-sm">{formData.missionStatement}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Services</h4>
                <p className="text-gray-700">Primary: {formData.primaryService}</p>
                <p className="text-gray-700">Target: {formData.targetPopulation}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Governance</h4>
                <p className="text-gray-700">Board Size: {formData.boardSize} members</p>
                <p className="text-gray-700">Board Chair: {formData.boardChairName}</p>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-800">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                Please review all information carefully. After submission, your profile will be 
                reviewed by our team within 2-3 business days.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Nonprofit Profile Registration
          </h1>
          <p className="text-gray-600">
            Complete this simple form to get started with your nonprofit profile
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div key={step.id} className="flex-1 relative">
                  <div className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : isCompleted
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`flex-1 h-1 mx-2 ${
                          isCompleted ? 'bg-green-600' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                  <p className={`text-xs mt-1 ${isActive ? 'font-semibold' : ''}`}>
                    {step.title}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {renderStepContent()}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </button>

            {currentStep < steps.length - 1 ? (
              <button
                onClick={handleNext}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    Submitting...
                    <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                  </>
                ) : (
                  <>
                    Submit Profile
                    <Send className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Need help? Contact us at support@calao.org</p>
          <p className="mt-2">
            Already have a profile? 
            <a href="/login" className="text-blue-600 hover:underline ml-1">
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClientOnboarding;