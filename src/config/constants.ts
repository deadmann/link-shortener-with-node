// config/constants.js
export const COOKIE_NAME = 'shortify_token';
export const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'; // or use assert()