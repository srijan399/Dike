import { AttestationId, ATTESTATION_ID } from '@selfxyz/core';

// Configuration constants
export const SELF_CONFIG = {
  SCOPE: process.env.NEXT_PUBLIC_SELF_SCOPE || 'dike',
  ENDPOINT: process.env.NEXT_PUBLIC_SELF_ENDPOINT || 'http://localhost:3000',
  MINIMUM_AGE: 18,
  EXCLUDED_COUNTRIES: ['IRN', 'PRK', 'RUS', 'SYR', 'CUB'] as const, // Iran, North Korea, Russia, Syria, Cuba
  OFAC_ENABLED: true,
  USER_ID_TYPE: 'hex' as const,
  MOCK_PASSPORT: false, // false = testnet, true = mainnet
};

// Allowed attestation IDs (excluding Aadhaar)
export const ALLOWED_ATTESTATION_IDS = new Map<AttestationId, boolean>([
  [ATTESTATION_ID.PASSPORT, true],
  [ATTESTATION_ID.BIOMETRIC_ID_CARD, true],
  // Add other attestation types as needed
  [ATTESTATION_ID.AADHAAR, true],
]);

// Frontend disclosures configuration
export const FRONTEND_DISCLOSURES = {
  minimumAge: SELF_CONFIG.MINIMUM_AGE,
  excludedCountries: [...SELF_CONFIG.EXCLUDED_COUNTRIES],
  nationality: true,
  gender: true,
};
