// config/auth.config.js
export const AUTH_CONFIG = {
  USE_MOCK_AUTH: true, // Set to false when you have MSAL credentials
  MSAL_CONFIG: {
    // Add your MSAL config here when ready
    clientId: process.env.REACT_APP_MSAL_CLIENT_ID,
    authority: process.env.REACT_APP_MSAL_AUTHORITY,
  }
};