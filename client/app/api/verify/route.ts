import { NextRequest, NextResponse } from 'next/server';
import { 
  SelfBackendVerifier, 
  DefaultConfigStore
} from '@selfxyz/core';
import { SELF_CONFIG, ALLOWED_ATTESTATION_IDS } from '@/lib/self-config';

// Initialize the SelfBackendVerifier
const selfBackendVerifier = new SelfBackendVerifier(
  SELF_CONFIG.SCOPE, // scope string
  `${SELF_CONFIG.ENDPOINT}/api/verify`, // endpoint URL
  SELF_CONFIG.MOCK_PASSPORT, // mockPassport → false = testnet, true = mainnet
  ALLOWED_ATTESTATION_IDS, // allowed attestation IDs map
  new DefaultConfigStore({ // config store
    minimumAge: SELF_CONFIG.MINIMUM_AGE,
    excludedCountries: [...SELF_CONFIG.EXCLUDED_COUNTRIES],
    ofac: SELF_CONFIG.OFAC_ENABLED,
  }),
  SELF_CONFIG.USER_ID_TYPE // user identifier type (matching your frontend config)
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { attestationId, proof, publicSignals, userContextData } = body;

    // Validate required fields
    if (!proof || !publicSignals || !attestationId || !userContextData) {
      return NextResponse.json({
        status: "error",
        result: false,
        reason: "Proof, publicSignals, attestationId and userContextData are required",
      }, { status: 200 });
    }

    // Verify the proof
    const result = await selfBackendVerifier.verify(
      attestationId,
      proof,
      publicSignals,
      userContextData
    );

    const { isValid, isMinimumAgeValid, isOfacValid } = result.isValidDetails;
    
    // Check if verification passed all checks
    if (!isValid || !isMinimumAgeValid || !isOfacValid) {
      let reason = "Verification failed";
      if (!isMinimumAgeValid) reason = "Minimum age verification failed";
      if (!isOfacValid) reason = "OFAC verification failed";
      
      return NextResponse.json({
        status: "error",
        result: false,
        reason,
        details: result.isValidDetails,
      }, { status: 200 });
    }

    // Success response
    return NextResponse.json({
      status: "success",
      result: true,
      attestationId: result.attestationId,
      discloseOutput: result.discloseOutput,
      userData: result.userData,
    }, { status: 200 });

  } catch (error) {
    console.error('Verification error:', error);
    
    return NextResponse.json({
      status: "error",
      result: false,
      reason: error instanceof Error ? error.message : "Unknown error",
    }, { status: 200 });
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
