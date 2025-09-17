'use client';

interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  photoURL?: string;
  businessId?: string;
  role: string;
  iat: number;
  exp: number;
}

/**
 * Decodes a JWT token without verification (client-side only)
 * Use this for extracting user data quickly without API calls
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    if (!token || typeof token !== 'string') {
      return null;
    }

    // Remove Bearer prefix if present
    const cleanToken = token.replace(/^Bearer\s+/, '');

    // Split the token
    const parts = cleanToken.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decode payload (second part)
    const payload = parts[1];

    // Add padding if needed for base64 decoding
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);

    // Decode base64
    const decodedPayload = atob(paddedPayload);

    // Parse JSON
    const parsedPayload = JSON.parse(decodedPayload) as JWTPayload;

    return parsedPayload;
  } catch (error) {
    console.warn('Failed to decode JWT token:', error);
    return null;
  }
}

/**
 * Checks if a JWT token is expired
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload) {
    return true;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
}

/**
 * Gets the expiration time of a JWT token
 */
export function getTokenExpiration(token: string): Date | null {
  const payload = decodeJWT(token);
  if (!payload) {
    return null;
  }

  return new Date(payload.exp * 1000);
}

/**
 * Checks if token expires within the specified minutes
 */
export function willTokenExpireSoon(token: string, minutesThreshold: number = 10): boolean {
  const payload = decodeJWT(token);
  if (!payload) {
    return true;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  const thresholdTime = currentTime + (minutesThreshold * 60);

  return payload.exp < thresholdTime;
}

/**
 * Creates a user object from JWT payload for optimistic authentication
 */
export function createUserFromJWT(token: string): any | null {
  const payload = decodeJWT(token);
  if (!payload) {
    return null;
  }

  return {
    id: payload.userId,
    email: payload.email,
    name: payload.name,
    photoURL: payload.photoURL || null,
    businessId: payload.businessId || null,
    role: payload.role,
    provider: 'jwt',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    // If user has businessId in JWT, they have a business
    business: payload.businessId ? {
      id: payload.businessId,
      // We'll fetch full business details later if needed
    } : null
  };
}

/**
 * Validates JWT token structure and basic integrity
 */
export function isValidJWTStructure(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }

  const cleanToken = token.replace(/^Bearer\s+/, '');
  const parts = cleanToken.split('.');

  if (parts.length !== 3) {
    return false;
  }

  try {
    // Try to decode header and payload
    const header = JSON.parse(atob(parts[0]));
    const payload = JSON.parse(atob(parts[1] + '='.repeat((4 - parts[1].length % 4) % 4)));

    // Basic validation
    return !!(
      header.typ &&
      payload.userId &&
      payload.email &&
      payload.exp &&
      payload.iat
    );
  } catch {
    return false;
  }
}

/**
 * Cache management for user data with timestamp
 */
interface CachedUserData {
  user: any;
  timestamp: number;
  tokenExpiry: number;
}

const CACHE_KEY = 'idean_user_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function getCachedUserData(): any | null {
  try {
    if (typeof window === 'undefined') return null;

    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const data: CachedUserData = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is expired or token is expired
    if (
      now > data.timestamp + CACHE_DURATION ||
      now > data.tokenExpiry
    ) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return data.user;
  } catch {
    return null;
  }
}

export function setCachedUserData(user: any, token: string): void {
  try {
    if (typeof window === 'undefined') return;

    const payload = decodeJWT(token);
    if (!payload) return;

    const cacheData: CachedUserData = {
      user,
      timestamp: Date.now(),
      tokenExpiry: payload.exp * 1000
    };

    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('Failed to cache user data:', error);
  }
}

export function clearUserCache(): void {
  try {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.warn('Failed to clear user cache:', error);
  }
}