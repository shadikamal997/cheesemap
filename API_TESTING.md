# CheeseMap API Testing Guide

## Quick Start

All endpoints available at `http://localhost:3000` (development) or `https://cheesemap.fr` (production).

## Authentication

All protected endpoints require Bearer token in Authorization header:
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## 🔐 Authentication APIs

### Register New User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "firstName": "Marie",
    "lastName": "Dubois"
  }'

# Response: { "message": "Registration successful. Please check your email.", "userId": "..." }
```

### Verify Email
```bash
curl http://localhost:3000/api/auth/verify-email?token=TOKEN_FROM_EMAIL

# Response: { "message": "Email verified successfully" }
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'

# Response:
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": { "id": "...", "email": "...", "role": "CUSTOMER" }
}
```

---

## 🏪 Business APIs

### Create Business
```bash
curl -X POST http://localhost:3000/api/businesses/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "SHOP",
    "displayName": "Fromagerie du Quartier",
    "siret": "12345678901234",
    "address": "15 Rue des Fromages",
    "city": "Lyon",
    "postalCode": "69001",
    "region": "Auvergne-Rhône-Alpes",
    "latitude": 45.764043,
    "longitude": 4.835659,
    "phone": "+33612345678",
    "email": "contact@fromagerie.fr"
  }'

# Response: { "message": "Business created successfully", "business": { ... } }
```

### Update Business Hours
```bash
curl -X POST http://localhost:3000/api/businesses/BUSINESS_ID/hours \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "hours": [
      {
        "day": "MONDAY",
        "openTime": "09:00",
        "closeTime": "18:00",
        "isClosed": false
      }
    ]
  }'
```

### Upload Business Image
```bash
curl -X POST http://localhost:3000/api/businesses/BUSINESS_ID/images \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/cheese.jpg" \
  -F "isPrimary=true" \
  -F "caption=Notre sélection de fromages"

# Response: { "message": "Image uploaded successfully", "image": { ... } }
```

---

## 📦 Inventory APIs (Shops)

### Add Inventory Item
```bash
curl -X POST http://localhost:3000/api/inventory \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "CHE-COM-250",
    "name": "Comté AOP 12 mois",
    "description": "Affiné 12 mois en cave",
    "category": "HARD",
    "milkType": "COW",
    "price": 8.50,
    "quantityAvailable": 10,
    "unitType": "KG",
    "minimumOrder": 0.25,
    "isAvailable": true
  }'
```

### Update Inventory
```bash
curl -X PATCH http://localhost:3000/api/inventory/INVENTORY_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quantityAvailable": 8,
    "price": 9.00
  }'
```

---

## 🧀 Farm Batch APIs (Farms)

### Create Batch
```bash
curl -X POST http://localhost:3000/api/batches \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "batchNumber": "2024-001",
    "cheeseName": "Camembert Fermier",
    "milkType": "COW",
    "productionDate": "2024-01-15",
    "initialQuantityKg": 50,
    "currentQuantityKg": 50,
    "pricePerKg": 25,
    "quantityProduced": 50,
    "quantityRemaining": 50,
    "unitType": "KG",
    "minimumAgeDays": 21,
    "status": "AGING",
    "location": "Cave A1"
  }'
```

### Add Aging Log
```bash
curl -X POST http://localhost:3000/api/batches/BATCH_ID/aging-log \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ageDays": 7,
    "temperature": 12.5,
    "humidity": 85,
    "weightKg": 49.8,
    "notes": "Croûte se forme bien",
    "loggedBy": "Jean Martin"
  }'
```

---

## 🛒 Order APIs

### Create Order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "inventoryId": "INV_ID",
        "itemName": "Comté AOP",
        "quantity": 0.5,
        "unitType": "KG",
        "pricePerUnit": 8.50,
        "unitPrice": 8.50
      }
    ],
    "deliveryMethod": "PICKUP",
    "paymentMethod": "CARD",
    "customerName": "Marie Dubois",
    "customerEmail": "marie@example.com",
    "customerPhone": "+33612345678"
  }'

# Response: { "message": "Order created successfully", "order": { "orderNumber": "ORD-..." } }
```

### Cancel Order
```bash
curl -X POST http://localhost:3000/api/orders/ORDER_ID/cancel \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Client request"
  }'
```

---

## 🚶 Tour APIs

### Create Tour
```bash
curl -X POST http://localhost:3000/api/tours \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Visite de la Fromagerie",
    "description": "Découvrez nos méthodes artisanales",
    "tourType": "GUIDED_TOUR",
    "durationMinutes": 90,
    "maxCapacity": 15,
    "maxParticipants": 15,
    "pricePerPerson": 12,
    "languages": ["fr"],
    "meetingPoint": "Entrée principale"
  }'
```

### Create Tour Schedule
```bash
curl -X POST http://localhost:3000/api/tours/TOUR_ID/schedule \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-02-15",
    "startTime": "14:00",
    "maxParticipants": 12,
    "notes": "Tour en français uniquement"
  }'
```

### Book a Tour
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "scheduleId": "SCHEDULE_ID",
    "participants": 2,
    "specialRequests": "Intéressé par l affinage"
  }'
```

---

## 💳 Payment APIs

### Create Payment Intent (Order)
```bash
curl -X POST http://localhost:3000/api/payments/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORDER_ID",
    "returnUrl": "http://localhost:3000/orders/success"
  }'

# Response: { "clientSecret": "pi_...", "paymentIntentId": "pi_..." }
```

### Create Payment Intent (Booking)
```bash
curl -X POST http://localhost:3000/api/payments/bookings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "BOOKING_ID",
    "returnUrl": "http://localhost:3000/bookings/success"
  }'
```

---

## 🔍 Search APIs

### Search Businesses/Products
```bash
curl "http://localhost:3000/api/search?q=comté&type=cheese"

# Response: {
#   "results": [...],
#   "total": 10,
#   "cached": false
# }
```

### Autocomplete
```bash
curl "http://localhost:3000/api/search/autocomplete?q=com"

# Response: {
#   "suggestions": ["Comté AOP", "Comté 12 mois", ...]
# }
```

---

## 👑 Admin APIs

### Get Pending Businesses
```bash
curl http://localhost:3000/api/admin/businesses \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Response: { "businesses": [...] }
```

### Verify Business
```bash
curl -X POST http://localhost:3000/api/admin/businesses/BUSINESS_ID/verify \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "approved": true,
    "notes": "Documents verified"
  }'
```

### Approve Tour
```bash
curl -X POST http://localhost:3000/api/admin/tours/TOUR_ID/approve \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "approved": true,
    "notes": "Content approved"
  }'
```

---

## 📤 File Upload API

### Upload Image
```bash
curl -X POST http://localhost:3000/api/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/image.jpg" \
  -F "folder=products"

# Response: {
#   "urls": {
#     "thumbnail": "https://cdn.../thumb.jpg",
#     "medium": "https://cdn.../medium.jpg",
#     "large": "https://cdn.../large.jpg"
#   }
# }
```

---

## 🧪 Test Rate Limiting

```bash
# Public endpoint: 120 requests/min
for i in {1..121}; do
  curl http://localhost:3000/api/search?q=test
  echo " Request $i"
done

# Should return 429 on request 121:
# { "error": "Too many requests", "retryAfter": 45 }
```

---

## ✅ Health Check

```bash
curl http://localhost:3000/api/health

# Response: { "status": "ok", "timestamp": "..." }
```

---

## 🐛 Common Errors

### 401 Unauthorized
```json
{ "error": "Authentication required" }
```
→ Add Authorization header with valid token

### 403 Forbidden
```json
{ "error": "Insufficient permissions" }
```
→ User role doesn't have access (need SHOP/FARM/ADMIN)

### 429 Too Many Requests
```json
{ "error": "Too many requests", "retryAfter": 45 }
```
→ Rate limit exceeded, wait specified seconds

### 422 Validation Error
```json
{
  "error": "Validation failed",
  "details": [
    { "field": "email", "message": "Invalid email format" }
  ]
}
```
→ Fix request body validation errors

---

**Full API Documentation:** See `/IMPLEMENTATION_SUMMARY.md` for detailed endpoint specifications
