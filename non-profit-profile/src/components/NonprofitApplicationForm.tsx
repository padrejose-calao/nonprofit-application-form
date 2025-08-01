import React, { useState } from 'react';
import './NonprofitApplicationForm.css';

interface ApplicationFormData {
  organizationName: string;
  ein: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  mission: string;
  annualBudget: string;
  grantAmount: string;
  projectDescription: string;
  timeline: string;
  expectedOutcomes: string;
  additionalInfo: string;
}

const NonprofitApplicationForm: React.FC = () => {
  const [formData, setFormData] = useState<ApplicationFormData>({
    organizationName: '',
    ein: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    mission: '',
    annualBudget: '',
    grantAmount: '',
    projectDescription: '',
    timeline: '',
    expectedOutcomes: '',
    additionalInfo: '',
  });

  const [errors, setErrors] = useState<Partial<ApplicationFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof ApplicationFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ApplicationFormData> = {};

    if (!formData.organizationName.trim()) {
      newErrors.organizationName = 'Organization name is required';
    }

    if (!formData.ein.trim()) {
      newErrors.ein = 'EIN is required';
    } else if (!/^\d{2}-\d{7}$/.test(formData.ein)) {
      newErrors.ein = 'EIN must be in format XX-XXXXXXX';
    }

    if (!formData.contactName.trim()) {
      newErrors.contactName = 'Contact name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
      newErrors.zipCode = 'Please enter a valid ZIP code';
    }

    if (!formData.mission.trim()) {
      newErrors.mission = 'Mission statement is required';
    }

    if (!formData.annualBudget.trim()) {
      newErrors.annualBudget = 'Annual budget is required';
    }

    if (!formData.grantAmount.trim()) {
      newErrors.grantAmount = 'Grant amount requested is required';
    }

    if (!formData.projectDescription.trim()) {
      newErrors.projectDescription = 'Project description is required';
    }

    if (!formData.timeline.trim()) {
      newErrors.timeline = 'Project timeline is required';
    }

    if (!formData.expectedOutcomes.trim()) {
      newErrors.expectedOutcomes = 'Expected outcomes are required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setSubmitSuccess(true);

      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          organizationName: '',
          ein: '',
          contactName: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          state: '',
          zipCode: '',
          mission: '',
          annualBudget: '',
          grantAmount: '',
          projectDescription: '',
          timeline: '',
          expectedOutcomes: '',
          additionalInfo: '',
        });
        setSubmitSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="success-message">
        <div className="success-content">
          <h2>Application Submitted Successfully!</h2>
          <p>
            Thank you for your nonprofit grant application. We will review your submission and
            contact you within 2-3 business days.
          </p>
          <div className="success-icon">✓</div>
        </div>
      </div>
    );
  }

  return (
    <div className="application-container">
      <div className="application-header">
        <h1>Nonprofit Grant Application</h1>
        <p>Please complete all required fields to submit your grant application.</p>
      </div>

      <form onSubmit={handleSubmit} className="application-form">
        {/* Organization Information */}
        <section className="form-section">
          <h2>Organization Information</h2>

          <div className="form-group">
            <label htmlFor="organizationName">
              Organization Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="organizationName"
              name="organizationName"
              value={formData.organizationName}
              onChange={handleInputChange}
              className={errors.organizationName ? 'error' : ''}
              placeholder="Enter your organization's legal name"
            />
            {errors.organizationName && (
              <span className="error-message">{errors.organizationName}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="ein">
              EIN (Employer Identification Number) <span className="required">*</span>
            </label>
            <input
              type="text"
              id="ein"
              name="ein"
              value={formData.ein}
              onChange={handleInputChange}
              className={errors.ein ? 'error' : ''}
              placeholder="XX-XXXXXXX"
            />
            {errors.ein && <span className="error-message">{errors.ein}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="mission">
              Mission Statement <span className="required">*</span>
            </label>
            <textarea
              id="mission"
              name="mission"
              value={formData.mission}
              onChange={handleInputChange}
              className={errors.mission ? 'error' : ''}
              placeholder="Describe your organization's mission and purpose"
              rows={4}
            />
            {errors.mission && <span className="error-message">{errors.mission}</span>}
          </div>
        </section>

        {/* Contact Information */}
        <section className="form-section">
          <h2>Primary Contact Information</h2>

          <div className="form-group">
            <label htmlFor="contactName">
              Contact Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="contactName"
              name="contactName"
              value={formData.contactName}
              onChange={handleInputChange}
              className={errors.contactName ? 'error' : ''}
              placeholder="Full name of primary contact"
            />
            {errors.contactName && <span className="error-message">{errors.contactName}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">
                Email Address <span className="required">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? 'error' : ''}
                placeholder="contact@organization.org"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="phone">
                Phone Number <span className="required">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={errors.phone ? 'error' : ''}
                placeholder="(555) 123-4567"
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="address">
              Street Address <span className="required">*</span>
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className={errors.address ? 'error' : ''}
              placeholder="123 Main Street"
            />
            {errors.address && <span className="error-message">{errors.address}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">
                City <span className="required">*</span>
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className={errors.city ? 'error' : ''}
                placeholder="City"
              />
              {errors.city && <span className="error-message">{errors.city}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="state">
                State <span className="required">*</span>
              </label>
              <select
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className={errors.state ? 'error' : ''}
              >
                <option value="">Select State</option>
                <option value="AL">Alabama</option>
                <option value="AK">Alaska</option>
                <option value="AZ">Arizona</option>
                <option value="AR">Arkansas</option>
                <option value="CA">California</option>
                <option value="CO">Colorado</option>
                <option value="CT">Connecticut</option>
                <option value="DE">Delaware</option>
                <option value="FL">Florida</option>
                <option value="GA">Georgia</option>
                <option value="HI">Hawaii</option>
                <option value="ID">Idaho</option>
                <option value="IL">Illinois</option>
                <option value="IN">Indiana</option>
                <option value="IA">Iowa</option>
                <option value="KS">Kansas</option>
                <option value="KY">Kentucky</option>
                <option value="LA">Louisiana</option>
                <option value="ME">Maine</option>
                <option value="MD">Maryland</option>
                <option value="MA">Massachusetts</option>
                <option value="MI">Michigan</option>
                <option value="MN">Minnesota</option>
                <option value="MS">Mississippi</option>
                <option value="MO">Missouri</option>
                <option value="MT">Montana</option>
                <option value="NE">Nebraska</option>
                <option value="NV">Nevada</option>
                <option value="NH">New Hampshire</option>
                <option value="NJ">New Jersey</option>
                <option value="NM">New Mexico</option>
                <option value="NY">New York</option>
                <option value="NC">North Carolina</option>
                <option value="ND">North Dakota</option>
                <option value="OH">Ohio</option>
                <option value="OK">Oklahoma</option>
                <option value="OR">Oregon</option>
                <option value="PA">Pennsylvania</option>
                <option value="RI">Rhode Island</option>
                <option value="SC">South Carolina</option>
                <option value="SD">South Dakota</option>
                <option value="TN">Tennessee</option>
                <option value="TX">Texas</option>
                <option value="UT">Utah</option>
                <option value="VT">Vermont</option>
                <option value="VA">Virginia</option>
                <option value="WA">Washington</option>
                <option value="WV">West Virginia</option>
                <option value="WI">Wisconsin</option>
                <option value="WY">Wyoming</option>
              </select>
              {errors.state && <span className="error-message">{errors.state}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="zipCode">
                ZIP Code <span className="required">*</span>
              </label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleInputChange}
                className={errors.zipCode ? 'error' : ''}
                placeholder="12345"
              />
              {errors.zipCode && <span className="error-message">{errors.zipCode}</span>}
            </div>
          </div>
        </section>

        {/* Grant Information */}
        <section className="form-section">
          <h2>Grant Information</h2>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="annualBudget">
                Annual Operating Budget <span className="required">*</span>
              </label>
              <input
                type="text"
                id="annualBudget"
                name="annualBudget"
                value={formData.annualBudget}
                onChange={handleInputChange}
                className={errors.annualBudget ? 'error' : ''}
                placeholder="$100,000"
              />
              {errors.annualBudget && <span className="error-message">{errors.annualBudget}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="grantAmount">
                Grant Amount Requested <span className="required">*</span>
              </label>
              <input
                type="text"
                id="grantAmount"
                name="grantAmount"
                value={formData.grantAmount}
                onChange={handleInputChange}
                className={errors.grantAmount ? 'error' : ''}
                placeholder="$25,000"
              />
              {errors.grantAmount && <span className="error-message">{errors.grantAmount}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="projectDescription">
              Project Description <span className="required">*</span>
            </label>
            <textarea
              id="projectDescription"
              name="projectDescription"
              value={formData.projectDescription}
              onChange={handleInputChange}
              className={errors.projectDescription ? 'error' : ''}
              placeholder="Describe the project or program for which you are seeking funding"
              rows={5}
            />
            {errors.projectDescription && (
              <span className="error-message">{errors.projectDescription}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="timeline">
              Project Timeline <span className="required">*</span>
            </label>
            <textarea
              id="timeline"
              name="timeline"
              value={formData.timeline}
              onChange={handleInputChange}
              className={errors.timeline ? 'error' : ''}
              placeholder="Describe the timeline for your project implementation"
              rows={3}
            />
            {errors.timeline && <span className="error-message">{errors.timeline}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="expectedOutcomes">
              Expected Outcomes <span className="required">*</span>
            </label>
            <textarea
              id="expectedOutcomes"
              name="expectedOutcomes"
              value={formData.expectedOutcomes}
              onChange={handleInputChange}
              className={errors.expectedOutcomes ? 'error' : ''}
              placeholder="What outcomes do you expect to achieve with this grant?"
              rows={4}
            />
            {errors.expectedOutcomes && (
              <span className="error-message">{errors.expectedOutcomes}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="additionalInfo">Additional Information</label>
            <textarea
              id="additionalInfo"
              name="additionalInfo"
              value={formData.additionalInfo}
              onChange={handleInputChange}
              placeholder="Any additional information you'd like to share"
              rows={3}
            />
          </div>
        </section>

        <div className="form-actions">
          <button type="submit" className="submit-button" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NonprofitApplicationForm;
