export interface NarrativeContent {
  full: string;
  short: string;
  alternate: string;
  historical: HistoricalEntry[];
}

export interface HistoricalEntry {
  id: string;
  content: string;
  timestamp: Date;
  author: string;
  versionNumber: number;
}

export interface NarrativeFieldData {
  [key: string]: NarrativeContent;
}

// Default narrative content structure
export const createDefaultNarrativeContent = (initialValue: string = ''): NarrativeContent => ({
  full: initialValue,
  short: '',
  alternate: '',
  historical: []
});

// List of all narrative fields in the application
export const NARRATIVE_FIELDS = [
  'brandVoice',
  'elevatorPitch',
  'backgroundStatement',
  'missionStatement',
  'visionStatement',
  'impactStatement',
  'strategiesStatement',
  'needsStatement',
  'primaryAreasOfImpact',
  'populationServed',
  'serviceAreas',
  'serviceAreaDescription',
  'externalAssessments',
  'fundraisingPlan',
  'strategicPlan',
  'continuityPlan',
  'technologyPlan',
  'successionPlan',
  'staffDemographics',
  'staffGenderDemographics',
  'ceoInfo',
  'directorsPolicy',
  'nondiscriminationPolicy',
  'documentDestructionPolicy',
  'whistleblowerPolicy',
  'policyProcedures',
  'governmentLicenses',
  'evaluations',
  'trainingPrograms',
  'professionalDevelopment',
  'compensationPolicy',
  'benefitsPolicy',
  'remoteWorkPolicy',
  'safetyPolicy',
  'emergencyProcedures',
  'programList',
  'programDescriptions',
  'programOutcomes',
  'programMetrics',
  'programFunding',
  'programPartners',
  'programEvaluation',
  'programVideos',
  'programTestimonials',
  'programImpact',
  'programChallenges',
  'programGoals',
  'programTimeline',
  'additionalInfo',
  'specialCircumstances'
] as const;

export type NarrativeFieldKey = typeof NARRATIVE_FIELDS[number];