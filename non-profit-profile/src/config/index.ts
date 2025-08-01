interface AppConfig {
  api: {
    baseUrl: string;
  };
  environment: 'development' | 'staging' | 'production';
  features: {
    autoSave: {
      enabled: boolean;
      interval: number;
    };
  };
  fileUpload: {
    maxSize: number;
    allowedTypes: string[];
  };
  auth: {
    provider: 'local' | 'oauth' | 'saml';
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
  };
  analytics: {
    id?: string;
  };
  errorTracking: {
    sentryDsn?: string;
  };
  export: {
    pdf: boolean;
    csv: boolean;
    json: boolean;
  };
}

const getConfig = (): AppConfig => {
  return {
    api: {
      baseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api'
    },
    environment: (process.env.REACT_APP_ENV as AppConfig['environment']) || 'development',
    features: {
      autoSave: {
        enabled: process.env.REACT_APP_ENABLE_AUTO_SAVE === 'true',
        interval: parseInt(process.env.REACT_APP_AUTO_SAVE_INTERVAL || '30000', 10)
      }
    },
    fileUpload: {
      maxSize: parseInt(process.env.REACT_APP_MAX_FILE_SIZE || '10485760', 10),
      allowedTypes: (process.env.REACT_APP_ALLOWED_FILE_TYPES || '.pdf,.doc,.docx,.jpg,.jpeg,.png').split(',')
    },
    auth: {
      provider: (process.env.REACT_APP_AUTH_PROVIDER as AppConfig['auth']['provider']) || 'local'
    },
    logging: {
      level: (process.env.REACT_APP_LOG_LEVEL as AppConfig['logging']['level']) || 'info'
    },
    analytics: {
      id: process.env.REACT_APP_ANALYTICS_ID
    },
    errorTracking: {
      sentryDsn: process.env.REACT_APP_SENTRY_DSN
    },
    export: {
      pdf: process.env.REACT_APP_ENABLE_PDF_EXPORT !== 'false',
      csv: process.env.REACT_APP_ENABLE_CSV_EXPORT !== 'false',
      json: process.env.REACT_APP_ENABLE_JSON_EXPORT !== 'false'
    }
  };
};

export const config = getConfig();

// Helper functions
export const isDevelopment = () => config.environment === 'development';
export const isProduction = () => config.environment === 'production';
export const isStaging = () => config.environment === 'staging';

// Validate config on initialization
const validateConfig = () => {
  // Only require API URL in production or when not using mock API
  const requiredEnvVars = isDevelopment() && !process.env.REACT_APP_USE_REAL_API 
    ? []
    : ['REACT_APP_API_BASE_URL'];
  const missing = requiredEnvVars.filter(key => !process.env[key]);
  
  if (missing.length > 0 && isProduction()) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

// Run validation
validateConfig();