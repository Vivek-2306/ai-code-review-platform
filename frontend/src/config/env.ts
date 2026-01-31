/**
 * Environment configuration with validation
 */

export const env = {
  // API Configuration
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  API_VERSION: process.env.NEXT_PUBLIC_API_VERSION || 'v1',

  // App Configuration
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'AI Code Review Platform',
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',

  // OAuth Configuration
  GITHUB_CLIENT_ID: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || '',
  GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',

  // Feature Flags
  ENABLE_OAUTH: process.env.NEXT_PUBLIC_ENABLE_OAUTH === 'true',

  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
};

/**
 * Get full API URL
 */
export function getApiUrl(path: string = ''): string {
  const baseUrl = env.API_URL.replace(/\/$/, '');
  const version = env.API_VERSION;
  const apiPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}/api/${version}${apiPath}`;
}
