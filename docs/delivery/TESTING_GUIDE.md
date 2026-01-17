# Business Signup Flow - Testing Guide

## Test Scenarios

### Scenario 1: Visitor Signup (Simple Flow)
**Steps:**
1. Navigate to `/signup/role`
2. Select "I'm a tourist/visitor"
3. Fill account form:
   - Name: Jean Dupont
   - Email: jean@example.com
   - Password: password123
4. Click "Create Account"

**Expected:**
- User account created via POST `/api/auth/register`
- Redirected to `/signup/success?role=visitor`
- Shows visitor features and next steps
- "Log In to Your Account" button redirects to `/login`

### Scenario 2: Shop Owner Signup (Full Flow)
**Steps:**
1. Navigate to `/signup/role`
2. Select "I own a cheese shop"
3. Fill account form:
   - Name: Marie Dubois
   - Email: marie@example.com
   - Password: password123
4. Click "Continue to Business Info"
5. Fill business form:
   - Legal Name: Fromagerie Dubois SARL
   - Display Name: La Fromagerie Parisienne
   - SIRET: 12345678901234
   - Address: 15 Rue de Seine
   - City: Paris
   - Postal Code: 75006
   - Region: Île-de-France
   - Phone: +33 1 42 22 50 45 (optional)
   - Email: contact@fromagerie.fr (optional)
   - Website: https://fromagerie.fr (optional)
6. Click "Continue"
7. Review modules page (informational)
8. Click "Complete Signup"

**Expected:**
- Step 3: User created, token stored
- Step 5: Address geocoded via French gov API
- Step 5: Business created via POST `/api/businesses/create`
  - Business in DRAFT status
  - isVisible: false
  - User role updated to SHOP
- Step 8: Redirected to `/signup/success?role=shop`
- Shows business verification pending notice
- "Log In to Your Account" button

**Database State:**
```sql
-- User
SELECT * FROM users WHERE email = 'marie@example.com';
-- role: SHOP

-- Business
SELECT * FROM businesses WHERE owner_id = <user_id>;
-- verificationStatus: DRAFT
-- isVisible: false
-- latitude/longitude: geocoded from address
```

### Scenario 3: Farm Producer Signup
**Steps:** Same as Shop Owner, but:
1. Select "I'm a cheese producer/farm"
2. Business type will be FARM
3. User role will be FARM

### Error Test Cases

#### Invalid Email
- Try: `notanemail`
- Expected: "Email is required" or validation error

#### Short Password
- Try: `123`
- Expected: "Password must be at least 8 characters"

#### Password Mismatch
- Password: `password123`
- Confirm: `password456`
- Expected: "Passwords do not match"

#### Invalid SIRET
- Try: `123` (too short)
- Expected: "SIRET must be 14 digits"

#### Invalid Postal Code
- Try: `1234` (too short)
- Expected: "Invalid French postal code (5 digits)"

#### Address Not Found
- Address: `Nonexistent Street 999`
- City: `Fakeville`
- Expected: "Address not found. Please verify the address, city, and postal code."

#### Duplicate Email
- Try registering with same email twice
- Expected: Backend returns 409 "Email already registered"

#### Duplicate SIRET
- Try creating business with existing SIRET
- Expected: Backend returns 409 "SIRET number already registered"

#### No Auth Token
- Try accessing `/signup/business` without completing account step
- Expected: Redirected to `/signup/role`

## API Endpoints Used

### POST /api/auth/register
**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "Jean",
  "lastName": "Dupont",
  "preferredLanguage": "fr"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "...",
    "email": "user@example.com",
    "role": "VISITOR"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST /api/businesses/create
**Request:**
```json
{
  "type": "SHOP",
  "legalName": "Fromagerie Dubois SARL",
  "displayName": "La Fromagerie Parisienne",
  "siret": "12345678901234",
  "addressLine1": "15 Rue de Seine",
  "city": "Paris",
  "postalCode": "75006",
  "region": "Île-de-France",
  "latitude": 48.8566,
  "longitude": 2.3522,
  "phone": "+33 1 42 22 50 45",
  "email": "contact@fromagerie.fr",
  "website": "https://fromagerie.fr"
}
```

**Response:**
```json
{
  "message": "Business created successfully",
  "business": {
    "id": "...",
    "ownerId": "...",
    "type": "SHOP",
    "displayName": "La Fromagerie Parisienne",
    "verificationStatus": "DRAFT",
    "isVisible": false,
    ...
  }
}
```

## Geocoding API

**Endpoint:** `https://api-adresse.data.gouv.fr/search/`

**Example Request:**
```
GET https://api-adresse.data.gouv.fr/search/?q=15%20Rue%20de%20Seine%2C%2075006%20Paris%2C%20France&limit=1
```

**Example Response:**
```json
{
  "features": [
    {
      "geometry": {
        "coordinates": [2.3363, 48.8547]
      },
      "properties": {
        "label": "15 Rue de Seine 75006 Paris",
        "score": 0.97
      }
    }
  ]
}
```

## Manual Testing Checklist

- [ ] Visitor signup completes successfully
- [ ] Shop signup creates user and business
- [ ] Farm signup creates user and business
- [ ] Business created in DRAFT status
- [ ] User role updated to SHOP/FARM
- [ ] Geocoding works for valid French addresses
- [ ] Geocoding fails gracefully for invalid addresses
- [ ] Loading states shown during API calls
- [ ] Error messages displayed for validation failures
- [ ] Success page shows correct role-based content
- [ ] Login button redirects to login page
- [ ] SessionStorage cleared on success page
- [ ] Can log in after signup
- [ ] Dashboard accessible after login
- [ ] Business visible in admin panel for verification

## Next Manual Steps After Signup

1. **Admin Verification** (requires admin account):
   - Go to admin dashboard
   - Find pending business in DRAFT status
   - Review business details
   - Approve or reject
   - Business becomes visible on map if approved

2. **Business Owner Next Steps** (after verification):
   - Add business hours
   - Upload business images
   - Add cheese inventory (shops)
   - Add batches (farms)
   - Configure tours (optional)
   - Set up delivery (optional)
