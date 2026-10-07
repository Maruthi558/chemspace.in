import { Platform } from 'react-native';

/**
 * ChemSpace Environment Config
 * Dynamically resolves API Base URL based on platform and environment variables.
 * Never hardcodes production endpoints.
 */
const configuredUrl = process.env.EXPO_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || '';

export const getApiBaseUrl = () => {
  if (configuredUrl) {
    // If running on web in a browser, replace Android emulator IP with localhost
    if (Platform.OS === 'web' && configuredUrl.includes('10.0.2.2')) {
      return configuredUrl.replace('10.0.2.2', 'localhost');
    }
    return configuredUrl.replace(/\/+$/, '');
  }

  // Sensible defaults
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000';
  }
  return 'http://localhost:8000';
};

export const API_BASE_URL = getApiBaseUrl();
export const API_URL = `${API_BASE_URL}/api`;
