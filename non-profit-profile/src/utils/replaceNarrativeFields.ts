// Helper script to guide the replacement of NarrativeEntryField with StandardizedNarrativeField

export const narrativeFieldMappings = [
  { id: 'narrative-field-1', field: 'brandVoice', section: 'brand' },
  { id: 'narrative-field-2', field: 'elevatorPitch', section: 'brand' },
  { id: 'narrative-field-3', field: 'backgroundStatement', section: 'narrative' },
  { id: 'narrative-field-4', field: 'missionStatement', section: 'narrative' },
  { id: 'narrative-field-5', field: 'visionStatement', section: 'narrative' },
  { id: 'narrative-field-6', field: 'impactStatement', section: 'narrative' },
  { id: 'narrative-field-7', field: 'strategiesStatement', section: 'narrative' },
  { id: 'narrative-field-8', field: 'needsStatement', section: 'narrative' },
  { id: 'narrative-field-9', field: 'primaryAreasOfImpact', section: 'narrative' },
  { id: 'narrative-field-10', field: 'populationServed', section: 'narrative' },
  { id: 'narrative-field-11', field: 'serviceAreas', section: 'narrative' },
  { id: 'narrative-field-12', field: 'serviceAreaDescription', section: 'narrative' },
  { id: 'narrative-field-13', field: 'externalAssessments', section: 'narrative' },
  { id: 'narrative-field-14', field: 'fundraisingPlan', section: 'management' },
  { id: 'narrative-field-15', field: 'strategicPlan', section: 'management' },
  { id: 'narrative-field-16', field: 'continuityPlan', section: 'management' },
  { id: 'narrative-field-17', field: 'technologyPlan', section: 'management' },
  { id: 'narrative-field-18', field: 'successionPlan', section: 'management' },
  { id: 'narrative-field-19', field: 'staffDemographics', section: 'management' },
  { id: 'narrative-field-20', field: 'staffGenderDemographics', section: 'management' },
  { id: 'narrative-field-21', field: 'ceoInfo', section: 'management' },
  { id: 'narrative-field-22', field: 'directorsPolicy', section: 'management' },
  { id: 'narrative-field-23', field: 'nondiscriminationPolicy', section: 'management' },
  { id: 'narrative-field-24', field: 'documentDestructionPolicy', section: 'management' },
  { id: 'narrative-field-25', field: 'whistleblowerPolicy', section: 'management' },
  { id: 'narrative-field-26', field: 'policyProcedures', section: 'management' },
  { id: 'narrative-field-27', field: 'governmentLicenses', section: 'management' },
  { id: 'narrative-field-28', field: 'evaluations', section: 'management' },
  { id: 'narrative-field-29', field: 'trainingPrograms', section: 'management' },
  { id: 'narrative-field-30', field: 'professionalDevelopment', section: 'management' },
  { id: 'narrative-field-31', field: 'compensationPolicy', section: 'management' },
  { id: 'narrative-field-32', field: 'benefitsPolicy', section: 'management' },
  { id: 'narrative-field-33', field: 'remoteWorkPolicy', section: 'management' },
  { id: 'narrative-field-34', field: 'safetyPolicy', section: 'management' },
  { id: 'narrative-field-35', field: 'emergencyProcedures', section: 'management' },
  { id: 'narrative-field-45', field: 'programList', section: 'programs' },
  { id: 'narrative-field-46', field: 'programDescriptions', section: 'programs' },
  { id: 'narrative-field-47', field: 'programOutcomes', section: 'programs' },
  { id: 'narrative-field-48', field: 'programMetrics', section: 'programs' },
  { id: 'narrative-field-49', field: 'programFunding', section: 'programs' },
  { id: 'narrative-field-50', field: 'programPartners', section: 'programs' },
  { id: 'narrative-field-51', field: 'programEvaluation', section: 'programs' },
  { id: 'narrative-field-52', field: 'programVideos', section: 'programs' },
  { id: 'narrative-field-53', field: 'programTestimonials', section: 'programs' },
  { id: 'narrative-field-54', field: 'programImpact', section: 'programs' },
  { id: 'narrative-field-55', field: 'programChallenges', section: 'programs' },
  { id: 'narrative-field-56', field: 'programGoals', section: 'programs' },
  { id: 'narrative-field-57', field: 'programTimeline', section: 'programs' },
  { id: 'narrative-field-58', field: 'additionalInfo', section: 'additional' },
  { id: 'narrative-field-59', field: 'specialCircumstances', section: 'additional' }
];

// Template for replacement
export const getStandardizedNarrativeFieldProps = (fieldName: string, section: string) => {
  return `
    value={narrativeFields.${fieldName}?.full || ''}
    onChange={(content) => onNarrativeChange('${fieldName}', content, 'full')}
    onFullChange={(content) => onNarrativeChange('${fieldName}', content, 'full')}
    onShortChange={(content) => onNarrativeChange('${fieldName}', content, 'short')}
    onAlternateChange={(content) => onNarrativeChange('${fieldName}', content, 'alternate')}
    fullContent={narrativeFields.${fieldName}?.full || ''}
    shortContent={narrativeFields.${fieldName}?.short || ''}
    alternateContent={narrativeFields.${fieldName}?.alternate || ''}
    historicalEntries={narrativeFields.${fieldName}?.historical || []}
    currentUser={currentUser?.email || 'Current User'}
    disabled={isFieldDisabled()}
  `;
};