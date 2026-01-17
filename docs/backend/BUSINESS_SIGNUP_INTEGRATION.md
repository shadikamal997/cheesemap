````markdown
# Business Signup Flow - Backend Integration

## Overview
Completed the integration of the business signup flow with real backend APIs, replacing sessionStorage mock with proper API calls.

## Changes Summary

### 1. Created Geocoding Utility (`lib/geocoding.ts`)
- **Purpose**: Convert French addresses to coordinates required by backend
- **API**: Uses French government's free Address API (`api-adresse.data.gouv.fr`)
- **Features**:
  - Validates addresses are in France
  - Returns latitude, longitude, formatted address, and confidence score
  - Proper error handling with typed error codes
  - France-only geofencing (lat: 41-51, lng: -5-10)

### 2. Updated Account Page (`app/(auth)/signup/account/page.tsx`)
**New Behavior**:
- Creates user account via `POST /api/auth/register`
- Stores JWT token in sessionStorage for subsequent API calls
- Handles loading states and error display
- For visitors: Completes signup and redirects to success
- For shop/farm: Continues to business info page

**Key Changes**:
- Added `loading` state
- Added error handling with `errors.general`
- Calls `/api/auth/register` with proper payload:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "firstName": "Jean",
    "lastName": "Dupont",
    "preferredLanguage": "fr"
  }
  ```
- Stores token and userId for next step

### 3. Updated Business Info Page (`app/(auth)/signup/business/page.tsx`)
**New Behavior**:
- Geocodes address using French Address API
- Creates business via `POST /api/businesses/create`
- Uses auth token from previous step
- Stores businessId for potential future use
- Redirects to modules page on success

**Key Changes**:
- Added required fields: `legalName`, `displayName`, `siret`, `email`
- Added geocoding before business creation
- Added loading states
- Calls `/api/businesses/create` with proper payload:
  ```json
  {
    "type": "SHOP" | "FARM",
    "legalName": "Société Fromagère",
    "displayName": "La Fromagerie",
    "siret": "12345678901234",
    "addressLine1": "15 Rue de Seine",
    "city": "Paris",
    "postalCode": "75006",
    "region": "Île-de-France",
    "latitude": 48.8566,
    "longitude": 2.3522,
    "phone": "+33 1 42 22 50 45",
    "email": "contact@example.com",
    "website": "https://example.com"
  }
  ```
- Backend automatically sets user role to SHOP or FARM
- Business created in DRAFT status for admin verification

### 4. Updated Modules Page (`app/(auth)/signup/modules/page.tsx`)
**New Behavior**:
- Simplified to just complete the signup flow
- Clears sessionStorage
- Redirects to success page

**Note**: Module selection (Tours, Delivery) is now informational only. These features require additional setup:
- **Tours**: Requires Stripe Connect, admin approval
- **Delivery**: Requires delivery settings configuration

These can be enabled later through the business dashboard.

## Signup Flow

### For Visitors
1. **Role Selection** → Choose "Visitor"
2. **Account Creation** → POST `/api/auth/register`
3. **Success** → Redirect to login

### For Shop/Farm Owners
1. **Role Selection** → Choose "Shop" or "Farm"
2. **Account Creation** → POST `/api/auth/register` (creates user, returns token)
3. **Business Info** → POST `/api/businesses/create` (with auth token)
   - Geocodes address automatically
   - Creates business in DRAFT status
   - Updates user role to SHOP/FARM
4. **Modules** → Informational page (no API call)
5. **Success** → Redirect to login

## API Integration

### Authentication Flow
- User created via `/api/auth/register`
- Token stored in sessionStorage: `signupData.token`
- Token used for business creation: `Authorization: Bearer ${token}`

### Business Creation
- Requires authenticated user (token)
- Validates SIRET uniqueness
- Geocodes address for lat/lng
- Creates business in DRAFT status
- Sets `isVisible: false` until admin verification
- Updates user's role automatically

### Geocoding
- Uses free French government API
- Validates coordinates within France
- Returns formatted address for verification
- Graceful error handling

## Database State After Signup

### User Record
```prisma
{
  email: "owner@example.com",
  firstName: "Jean",
  lastName: "Dupont",
  role: "SHOP" | "FARM",  // Updated by business creation
  preferredLanguage: "fr"
}
```

### Business Record
```prisma
{
  ownerId: userId,
  type: "SHOP" | "FARM",
  legalName: "...",
  displayName: "...",
  siret: "...",
  addressLine1: "...",
  city: "...",
  postalCode: "...",
  region: "...",
  latitude: 48.8566,
  longitude: 2.3522,
  verificationStatus: "DRAFT",
  isVisible: false
}
```

## Next Steps for Business Owners

After signup, business owners need to:

1. **Login** - Use credentials to access dashboard
2. **Complete Profile** - Add description, hours, images
3. **Submit for Verification** - Admin reviews and approves
4. **Enable Modules** (Optional):
   - **Tours**: Set up Stripe Connect, create tour offerings
   - **Delivery**: Configure delivery zones and pricing

## Security Notes

- Passwords hashed via bcrypt in backend
- JWT tokens for authentication
- Business creation requires valid auth token
- One business per user (enforced by backend)
- SIRET uniqueness enforced
- France-only addresses validated

## Error Handling

All pages now include:
- Loading states during API calls
- Error messages displayed to users
- Validation errors shown inline
- Network error handling
- Backend error messages surfaced to UI

````