# Trial System - Quick Reference

## Core Functions

### `initializeTrial(businessId, planId)`
Called on business signup to create 30-day trial.
```typescript
const { subscriptionId, trialStartAt, trialEndAt } = 
  await initializeTrial(businessId, planId);
```

### `enforceTrialExpiration(businessId, action?)`
**Add BEFORE EVERY business action** to block expired trials.
```typescript
await enforceTrialExpiration(businessId);  // Throws if expired & no payment
```

### `checkTrialStatus(businessId)`
Get current trial status.
```typescript
const { isInTrial, daysRemaining, mustRenew } = 
  await checkTrialStatus(businessId);
```

### `cancelTrial(businessId)`
Allow business to cancel trial (access continues until end date).
```typescript
const { canceledAt, accessUntil } = 
  await cancelTrial(businessId);
```

### `getTrialInfo(businessId)`
Get display info for dashboard.
```typescript
const { isInTrial, daysRemaining, showReminder } = 
  await getTrialInfo(businessId);
```

---

## API Endpoints

### GET /api/businesses/[id]/trial
Returns trial status and countdown.
```bash
curl "http://localhost:3001/api/businesses/SHOP-ID/trial"
# Returns: { trial: { isInTrial, daysRemaining, ... } }
```

### POST /api/businesses/[id]/trial
Cancel trial (access continues until original end date).
```bash
curl -X POST "http://localhost:3001/api/businesses/SHOP-ID/trial"
# Returns: { canceledAt, accessUntil, message }
```

---

## Frontend Components

### Trial Banner
```tsx
import TrialBanner from '@/components/dashboard/TrialBanner';

<TrialBanner businessId={businessId} onCancel={handleRefresh} />
```

Shows:
- ⏳ Countdown (X jours restants)
- Color alert (red if ≤7 days)
- Cancel button
- Upgrade button

---

## Database Queries

### Get trial info
```sql
SELECT 
  status, 
  trialStartAt, 
  trialEndAt, 
  trialActive,
  CURRENT_DATE - trialEndAt as days_remaining
FROM business_subscriptions
WHERE businessId = 'BUSINESS-ID';
```

### Find expiring soon
```sql
SELECT * FROM business_subscriptions
WHERE status = 'TRIAL' 
  AND trialEndAt < NOW() + INTERVAL 7 DAY
  AND trialActive = true;
```

### Find expired (no payment)
```sql
SELECT * FROM business_subscriptions
WHERE status = 'TRIAL' 
  AND trialEndAt < NOW()
  AND trialActive = true;
```

---

## Error Handling

### Trial expired response
```json
{
  "code": "SUBSCRIPTION_REQUIRED",
  "message": "Votre période d'essai est terminée. Veuillez activer votre abonnement.",
  "status": 402
}
```

### Duplicate trial
```json
{
  "code": "TRIAL_ALREADY_EXISTS",
  "message": "Cette entreprise possède déjà un abonnement.",
  "status": 400
}
```

---

## Integration Pattern

### Add to Any Business API Endpoint

```typescript
export async function POST(request: NextRequest) {
  const businessId = params.id;
  
  // 1. ALWAYS enforce trial expiration first
  await enforceTrialExpiration(businessId, 'action_name');
  
  // 2. Get subscription (guaranteed valid)
  const subscription = await getBusinessSubscriptionWithPlan(businessId);
  
  // 3. Continue with business logic
  // Plan limits still enforced during trial
  
  return NextResponse.json({ /* response */ });
}
```

---

## French Messaging

### Signup Success
```
🎁 Essai Gratuit Activé
Premier mois offert — Aucun paiement
Essai jusqu'au: [date]
```

### Dashboard (Active)
```
⏳ Essai gratuit — 15 jours restants
Vous utilisez le plan Essential (€25/mois) sans frais.
```

### Dashboard (≤7 days warning)
```
⏳ Essai gratuit — 3 jours restants
Préparez-vous à activer votre abonnement.
```

### On Error
```
Votre période d'essai est terminée.
Veuillez activer votre abonnement pour continuer.
```

---

## Key Rules

1. **Exactly 30 days**: `30 * 24 * 60 * 60 * 1000` milliseconds
2. **One per business**: Unique constraint on `businessId`
3. **Server-side only**: No frontend-only checks
4. **Must enforce**: Call before EVERY business action
5. **Plan limits still apply**: Trial doesn't bypass limits
6. **Cancel possible**: But access continues until end date
7. **Auto-renew default**: Payment attempted at trial end
8. **Stripe ready**: Fields set for payment processing

---

## File Locations

| What | Where |
|------|-------|
| Trial logic | `lib/trial.ts` |
| API endpoints | `app/api/businesses/[id]/trial/route.ts` |
| Dashboard banner | `components/dashboard/TrialBanner.tsx` |
| API integration | `app/api/businesses/create/route.ts` |
| Enforcement | `lib/plan-enforcement.ts` |
| Database | `prisma/schema.prisma` |
| Full docs | `docs/delivery/TRIAL_SYSTEM_IMPLEMENTATION.md` |

---

## Testing Commands

### Create business (starts trial)
```bash
curl -X POST "http://localhost:3001/api/businesses/create" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "type": "SHOP",
    "legalName": "Test Fromagerie",
    "displayName": "Test",
    "siret": "12345678901234",
    "addressLine1": "123 Rue",
    "city": "Paris",
    "postalCode": "75001",
    "region": "Île-de-France",
    "latitude": 48.8566,
    "longitude": 2.3522
  }'
```

### Check trial status
```bash
curl "http://localhost:3001/api/businesses/SHOP-ID/trial" \
  -H "Authorization: Bearer TOKEN"
```

### Cancel trial
```bash
curl -X POST "http://localhost:3001/api/businesses/SHOP-ID/trial" \
  -H "Authorization: Bearer TOKEN"
```

---

## Deployment

```bash
# 1. Run migration
npm run prisma:migrate "add_trial_fields_to_subscription"

# 2. Seed test data
npm run db:seed

# 3. Deploy backend
git push origin main

# 4. Deploy frontend
# (Automatic via CI/CD)

# 5. Verify
# - Check dashboard shows trial banner
# - Check pricing pages show messaging
# - Check API endpoints respond
```

---

## Support

**Questions?** See:
- Full guide: `docs/delivery/TRIAL_SYSTEM_IMPLEMENTATION.md`
- Implementation: `lib/trial.ts` (source + JSDoc)
- Checklist: `TRIAL_IMPLEMENTATION_CHECKLIST.md`

---

**Status**: ✅ Production Ready
**Version**: 1.0
**Date**: January 18, 2026
