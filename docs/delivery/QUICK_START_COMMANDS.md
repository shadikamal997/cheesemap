# 🚀 IMMEDIATE ACTION ITEMS - Run These Commands

## 1️⃣ Deploy Database Migrations

```bash
# Navigate to project
cd /Users/shadi/Desktop/cheesemap

# Check migration status
npx prisma migrate status

# Deploy all pending migrations to Neon
npx prisma migrate deploy

# Expected output:
# ✅ All migrations applied successfully
# ✅ PostGIS extension enabled
```

---

## 2️⃣ Seed Minimal Data

```bash
# Run the seed script with all prepared data
npx prisma db seed

# Expected output:
# ✅ Admin user created: admin@cheesemap.fr (password: Admin123!@#)
# ✅ Test shop: shop@test.cheesemap.fr (password: Shop123!@#)
# ✅ Test farm: farm@test.cheesemap.fr (password: Farm123!@#)
# ✅ 27 delivery zones created
# ✅ 12 achievements created
# ✅ 2 test businesses (PENDING status)
```

---

## 3️⃣ Verify Database Setup

```bash
# Open Prisma Studio to visually inspect data
npx prisma studio

# Open browser to http://localhost:5555
# Verify:
#   ✓ Users table: 3 users (admin, shop, farm)
#   ✓ Businesses table: 2 pending businesses
#   ✓ DeliveryZones table: 27 zones
#   ✓ Achievements table: 12 achievements
#   ✓ All relations intact
```

---

## 4️⃣ Build & Type Check

```bash
# Verify TypeScript compilation
npx tsc --noEmit

# Build for production
npm run build

# Expected:
# ✅ No TypeScript errors
# ✅ Build succeeds
# ✅ 53 pages generated
```

---

## 5️⃣ Start Development Server

```bash
# Terminal 1: Start dev server
npm run dev

# Expected:
# ✅ Server listening on http://localhost:3000
# ✅ Ready in 2-3s
```

---

## 6️⃣ Test Authentication Flows

### **Test A: Visitor Registration**
```bash
# In another terminal, or use Postman/REST Client

# Step 1: Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "visitor@test.com",
    "password": "Visitor123!@#",
    "firstName": "Test",
    "lastName": "Visitor"
  }'

# Expected: 201, "Please check your email to verify your account"

# Step 2: Get verification token from email (or check database)
# npx prisma studio → Users → Find visitor@test.com → Copy emailVerificationToken

# Step 3: Verify email
curl -X POST http://localhost:3000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"token": "<verification-token-from-email>"}'

# Expected: 200, "Email verified successfully"

# Step 4: Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "visitor@test.com",
    "password": "Visitor123!@#"
  }'

# Expected: 200, returns accessToken, refreshToken, user with role=VISITOR

# Step 5: Test dashboard access
# Browser: http://localhost:3000/dashboard/visitor
# Expected: Redirects and shows visitor dashboard

# Step 6: Test access block
# Browser: http://localhost:3000/dashboard/shop
# Expected: Redirects back to http://localhost:3000/dashboard/visitor
```

### **Test B: Shop Owner Flow**
```bash
# Step 1: Register as shop
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newshop@test.com",
    "password": "Shop123!@#"
  }'

# Step 2: Verify email (get token from DB)
# Step 3: Login
# Step 4: Create business
curl -X POST http://localhost:3000/api/businesses/create \
  -H "Authorization: Bearer <access-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "SHOP",
    "legalName": "Test Fromagerie SARL",
    "displayName": "Test Shop",
    "siret": "12345678900999",
    "addressLine1": "1 Rue de Test",
    "city": "Paris",
    "postalCode": "75001",
    "region": "Île-de-France",
    "latitude": 48.8566,
    "longitude": 2.3522
  }'

# Expected: 201, business.verificationStatus = "DRAFT", isVisible = false

# Step 5: Verify NOT on public list
curl http://localhost:3000/api/businesses

# Expected: New shop NOT in results (isVisible=false)
```

### **Test C: Admin Approval**
```bash
# Step 1: Login as admin
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@cheesemap.fr",
    "password": "Admin123!@#"
  }'

# Expected: 200, returns admin token, role=ADMIN

# Step 2: List pending businesses
curl -X GET "http://localhost:3000/api/admin/businesses?status=PENDING" \
  -H "Authorization: Bearer <admin-token>"

# Expected: 200, returns array of pending businesses

# Step 3: Approve first business
curl -X POST http://localhost:3000/api/admin/businesses/{businessId}/verify \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"approve": true, "notes": "Approved for production"}'

# Expected: 200, business.verificationStatus = "VERIFIED"

# Step 4: Verify now visible publicly
curl http://localhost:3000/api/businesses

# Expected: Approved business now in results with isVisible=true
```

---

## 7️⃣ Verify Security

### **Test Email Verification Block**
```bash
# Create user but DON'T verify email
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "unverified@test.com", "password": "Test123!@#"}'

# Try to access API without verification
curl -X GET http://localhost:3000/api/bookings \
  -H "Authorization: Bearer <unverified-token>"

# Expected: 403, "Email verification required"
```

### **Test Rate Limiting**
```bash
# Make 15 rapid requests (limit is 10/min for auth endpoints)
for i in {1..15}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email": "test@test.com", "password": "wrong"}'
  echo "Request $i"
done

# Expected: First 10 requests process, requests 11-15 get 429 status
```

### **Test Invalid Token Rejection**
```bash
curl -X GET http://localhost:3000/api/bookings \
  -H "Authorization: Bearer invalid.token.here"

# Expected: 401, "Unauthorized"
```

---

## 8️⃣ Check Logs for Errors

```bash
# In npm run dev terminal, watch for:
# ✓ No TypeScript errors
# ✓ No authentication failures
# ✓ No 500 errors
# ✗ Address any red flags immediately
```

---

## ✅ Success Indicators

After completing all steps:

- [x] Database migrations deployed
- [x] Seed data in database
- [x] Visitor registration/login works
- [x] Shop owner can create business
- [x] Admin can approve businesses
- [x] Email verification blocks API access
- [x] Rate limiting triggered
- [x] Role-based access control working
- [x] Approved businesses visible
- [x] Unapproved businesses hidden
- [x] Build passes
- [x] No errors in console

---

## 🚨 Common Issues & Fixes

### **Issue: "Can't reach database server"**
```bash
# Solution: Check DATABASE_URL in .env.local
echo $DATABASE_URL
# Should be: postgresql://... from Neon
```

### **Issue: "PostGIS extension not found"**
```bash
# Solution: Database uses postgis extension
# It's configured in schema.prisma and auto-enabled
# Check Prisma Studio to verify tables created
```

### **Issue: "Migrations failed"**
```bash
# Solution: Check migration history
npx prisma migrate status

# If stuck, use:
npx prisma migrate resolve --rolled-back <migration-name>
npx prisma migrate deploy
```

### **Issue: "Email not sending"**
```bash
# Solution: Check Resend API key in .env.local
# Resend test emails work in sandbox mode
# Check spam folder or Resend dashboard
```

### **Issue: "Token not set in cookies"**
```bash
# Solution: Check browser DevTools → Application → Cookies
# accessToken should be present after login
# SameSite=Lax, Path=/, Max-Age=900
```

---

## 🎯 Timeline

- **Migrations**: 2-3 minutes
- **Seed data**: 1-2 minutes  
- **Studio verification**: 2-3 minutes
- **Build test**: 3-5 minutes
- **Dev server start**: 2-3 minutes
- **Auth tests**: 10-15 minutes
- **Security tests**: 5-10 minutes

**Total:** ~30-45 minutes

---

## 📞 Need Help?

If stuck, check:
1. `STEP_11_COMPLETION.md` - Full documentation
2. `AUTH_TESTING_COMPLETE.md` - Test matrix
3. Console logs for specific errors
4. Prisma Studio for data verification
5. Network tab in browser DevTools

---

**Ready to Deploy!** 🚀
