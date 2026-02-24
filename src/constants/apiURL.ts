// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL,
  TIMEOUT: 30000,
};

// Authentication Endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: "/auth/login",
  REFRESH_TOKEN: "/auth/refresh-token",
  CHANGE_PASSWORD: "/auth/change-password",
  PROFILES: "/auth/profiles",
  FORGET_PASSWORD: "/auth/forget-password",
  RESET_PASSWORD: "/auth/reset-password",
  VERIFY_PARENT_PIN: "/auth/profiles/verify-parent-pin",
  SELECT_STUDENT: "/auth/profiles/select-student",
  CHANGE_PIN: "/auth/change-pin",
  REQUEST_PIN_RESET: "/auth/profiles/request-pin-reset",
};

// All API Endpoints
export const API_ENDPOINTS = {
  AUTH: AUTH_ENDPOINTS,
};