#!/usr/bin/env python3
import re

# Read schema
with open('prisma/schema.prisma', 'r') as f:
    content = f.read()

# Fix 1: Rename Booking to TourBooking
content = re.sub(r'\bBooking\b(?!\s+@relation)', 'TourBooking', content)
content = content.replace('@@map("bookings")', '@@map("tour_bookings")')

# Fix 2: Rename BatchAgingLog to AgingLog  
content = re.sub(r'model BatchAgingLog', 'model AgingLog', content)
content = content.replace('@@map("batch_aging_logs")', '@@map("aging_logs")')
content = re.sub(r'BatchAgingLog\[\]', 'AgingLog[]', content)

# Fix 3: Fix FarmBatch - add missing fields before 'status'
farm_batch_pattern = r'(model FarmBatch \{[^}]*?)(\n  status\s+BatchStatus)'
farm_batch_replacement = r'\1\n  initialQuantityKg Float\n  currentQuantityKg Float\n  pricePerKg        Float\n  minimumAgeDays    Int              @default(0)\n  location          String?\n  temperature       Float?\n  humidity          Float?\2'
content = re.sub(farm_batch_pattern, farm_batch_replacement, content, flags=re.DOTALL)

# Fix 4: Fix AgingLog fields
content = re.sub(r'weight\s+Float\?', 'weightKg    Float?', content)
content = re.sub(r'visualNotes\s+String\?', 'notes       String?', content)
content = re.sub(r'actionTaken\s+String\?', '', content)  
content = re.sub(r'loggedBy\s+String\?', 'photos      Json?\n  loggedBy    String', content)

# Fix 5: Add caption to BusinessImage (already has it, just ensure)
# Already done in previous multi_replace

# Fix 6: Add missing Order fields
order_pattern = r'(model Order \{[^}]*?orderType\s+OrderType)(\s+status\s+OrderStatus)'
order_replacement = r'\1?\n  deliveryMethod  String?\n  deliveryNotes   String?\2'
content = re.sub(order_pattern, order_replacement, content, flags=re.DOTALL)

order_amount_pattern = r'(totalAmount\s+Float\s+currency\s+String\s+@default\("EUR"\))'
order_amount_replacement = r'total           Float\n  \1'
content = re.sub(order_amount_pattern, order_amount_replacement, content)

order_cancel_pattern = r'(notes\s+String\?)(\s+createdAt\s+DateTime)'
order_cancel_replacement = r'\1\n  cancelledBy     String?\n  cancellationReason String?\n  refundStatus    String?\2'
content = re.sub(order_cancel_pattern, order_cancel_replacement, content, flags=re.DOTALL)

# Fix 7: Fix OrderItem - make inventoryId required and add pricePerUnit, subtotal
orderitem_pattern = r'(model OrderItem \{[^}]*?inventoryId\s+String)\?\n  inventory\s+ShopInventory\?'
orderitem_replacement = r'\1\n  inventory    ShopInventory'
content = re.sub(orderitem_pattern, orderitem_replacement, content, flags=re.DOTALL)

orderitem_fields_pattern = r'(quantity\s+Float)(\s+unitType\s+UnitType)'
orderitem_fields_replacement = r'\1\n  pricePerUnit Float\n  subtotal     Float\2'
content = re.sub(orderitem_fields_pattern, orderitem_fields_replacement, content)

# Fix 8: Add Payment fields
payment_pattern = r'(currency\s+String\s+@default\("EUR"\))(\s+paymentMethod\s+PaymentMethod\?)'
payment_replacement = r'\1\n  provider                String        @default("STRIPE")\2'
content = re.sub(payment_pattern, payment_replacement, content)

payment_fields_pattern = r'(status\s+PaymentStatus\s+@default\(PENDING\))(\s+stripePaymentIntentId\s+String\?)'
payment_fields_replacement = r'\1\n  \n  providerPaymentId       String?\2'
content = re.sub(payment_fields_pattern, payment_fields_replacement, content)

payment_refund_pattern = r'(refundReason\s+String\?)(\s+createdAt\s+DateTime)'
payment_refund_replacement = r'\1\n  paidAt                  DateTime?\n  refundedAt              DateTime?\n  metadata                Json?\2'
content = re.sub(payment_refund_pattern, payment_refund_replacement, content, flags=re.DOTALL)

# Fix 9: Add Tour approvalStatus and isActive
tour_status_pattern = r'(status\s+TourStatus\s+@default\(DRAFT\))(\s+requiresAdminApproval)'
tour_status_replacement = r'\1\n  approvalStatus          String     @default("PENDING")\n  isActive                Boolean    @default(false)\2'
content = re.sub(tour_status_pattern, tour_status_replacement, content)

# Fix 10: Add TourSchedule maxParticipants, priceOverride, notes, bookings relation
tourschedule_pattern = r'(maxCapacity\s+Int)(\s+bookedSpots\s+Int)'
tourschedule_replacement = r'\1\n  maxParticipants Int\2'
content = re.sub(tourschedule_pattern, tourschedule_replacement, content)

tourschedule_fields_pattern = r'(isAvailable\s+Boolean\s+@default\(true\))(\s+createdAt\s+DateTime)'
tourschedule_fields_replacement = r'\1\n  priceOverride   Float?\n  notes           String?\n  \n  bookings        TourBooking[]\2'
content = re.sub(tourschedule_fields_pattern, tourschedule_fields_replacement, content, flags=re.DOTALL)

# Fix 11: Update TourBooking fields
tourbooking_pattern = r'(model TourBooking \{[^}]*?bookingNumber\s+String\s+@unique\s+)(tourId\s+String)'
tourbooking_replacement = r'\1\n  scheduleId        String\n  \2'
content = re.sub(tourbooking_pattern, tourbooking_replacement, content, flags=re.DOTALL)

tourbooking_user_pattern = r'userId\s+String\s+user\s+User'
tourbooking_user_replacement = r'customerId        String\n  user              User'
content = re.sub(tourbooking_user_pattern, tourbooking_user_replacement, content)

tourbooking_guest_pattern = r'guestName\s+String\s+guestEmail\s+String\s+guestPhone\s+String\s+numberOfGuests\s+Int\s+totalAmount\s+Float'
tourbooking_guest_replacement = r'customerName      String\n  customerEmail     String\n  customerPhone     String?\n  participants      Int\n  pricePerPerson    Float\n  totalPrice        Float'
content = re.sub(tourbooking_guest_pattern, tourbooking_guest_replacement, content)

tourbooking_status_pattern = r'paymentStatus\s+PaymentStatus\s+@default\(PENDING\)\s+bookingStatus\s+BookingStatus\s+@default\(PENDING\)'
tourbooking_status_replacement = r'status            BookingStatus @default(PENDING)'
content = re.sub(tourbooking_status_pattern, tourbooking_status_replacement, content)

tourbooking_index_pattern = r'@@index\(\[userId, bookingStatus\]\)'
tourbooking_index_replacement = r'@@index([customerId, status])'
content = re.sub(tourbooking_index_pattern, tourbooking_index_replacement, content)

# Fix 12: Add Business stripeAccountId
business_contact_pattern = r'(website\s+String\?)(\s+// Verification)'
business_contact_replacement = r'\1\n  \n  // Stripe Connect\n  stripeAccountId         String?\2'
content = re.sub(business_contact_pattern, business_contact_replacement, content, flags=re.DOTALL)

# Fix 13: VerificationRequest - rename adminNotes to reviewNotes and add rejectionReason
verification_pattern = r'adminNotes\s+String\?'
verification_replacement = r'reviewNotes   String?\n  rejectionReason String?'
content = re.sub(verification_pattern, verification_replacement, content)

# Fix 14: Rename BusinessDeliverySettings to DeliverySettings
content = re.sub(r'model BusinessDeliverySettings', 'model DeliverySettings', content)
content = re.sub(r'BusinessDeliverySettings\?', 'DeliverySettings?', content)

# Write corrected schema
with open('prisma/schema.prisma', 'w') as f:
    f.write(content)

print("Schema fixed successfully!")
