# Self Identity Backend Verifier

This implementation provides a backend verifier for Self Identity verification using the `@selfxyz/core` library in a Next.js application.

## Files Created

- `app/api/verify/route.ts` - Main API endpoint for verification
- `lib/self-config.ts` - Shared configuration between frontend and backend
- Updated `components/SelfKYC.tsx` - Frontend component using shared config

## Configuration

The verification is configured through environment variables and the shared config file:

```env
NEXT_PUBLIC_SELF_APP_NAME="Dike KYC"
NEXT_PUBLIC_SELF_SCOPE="dike-kyc"
NEXT_PUBLIC_SELF_ENDPOINT="http://localhost:3000"
```

## Features

- **Document Type Filtering**: Only accepts Passport and Biometric ID Card (excludes Aadhaar)
- **Age Verification**: Minimum age of 18
- **Country Restrictions**: Excludes Iran, North Korea, Russia, Syria, and Cuba
- **OFAC Compliance**: Enabled for sanctions screening
- **Testnet Support**: Configured for testnet (set `MOCK_PASSPORT: true` for mainnet)

## API Endpoint

### POST `/api/verify`

Verifies a Self Identity proof.

**Request Body:**

```json
{
  "attestationId": 1,
  "proof": {
    "a": ["string", "string"],
    "b": [
      ["string", "string"],
      ["string", "string"]
    ],
    "c": ["string", "string"]
  },
  "publicSignals": ["string"],
  "userContextData": "string"
}
```

**Response (Success):**

```json
{
  "status": "success",
  "result": true,
  "attestationId": 1,
  "discloseOutput": {
    "minimumAge": "18",
    "nationality": "IND",
    "gender": "M"
  },
  "userData": {
    "userIdentifier": "0x...",
    "userDefinedData": "..."
  }
}
```

**Response (Error):**

```json
{
  "status": "error",
  "result": false,
  "reason": "Verification failed"
}
```

## Usage

1. Start your Next.js development server:

   ```bash
   npm run dev
   ```

2. The verification endpoint will be available at `http://localhost:3000/api/verify`

3. Self's relayers will automatically call this endpoint after proof generation

## Development Notes

- The endpoint returns HTTP 200 for both success and error cases (as required by Self)
- CORS headers are included for cross-origin requests
- All verification logic is handled by the `SelfBackendVerifier` class
- Configuration is centralized in `lib/self-config.ts` for consistency

## Production Deployment

For production:

1. Update environment variables:

   ```env
   NEXT_PUBLIC_SELF_ENDPOINT="https://your-domain.com"
   NEXT_PUBLIC_SELF_SCOPE="your-production-scope"
   ```

2. Set `MOCK_PASSPORT: true` in `lib/self-config.ts` for mainnet

3. Ensure your API endpoint is publicly accessible to Self's relayers
