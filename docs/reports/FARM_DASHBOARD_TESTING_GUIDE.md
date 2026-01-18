# Farm Dashboard Testing Guide

## Quick Test Instructions

### 1. Login as Farm User
```
Email: farm@test.cheesemap.fr
Password: Farm123!@#
```

### 2. Test Each Page

Navigate through all 8 pages using the sidebar:

#### ✅ Overview (`/dashboard/farm`)
- Should display: Recent batches, tours, quick stats
- Check: Data loads from API

#### ✅ Batches (`/dashboard/farm/batches`)
- Click "New Batch" button
- Fill form: Cheese Name, Milk Type, Quantity, Aging days
- Submit → Should create batch and refresh list
- Check: Aging progress bars display
- Check: Status badges show correct colors

#### ✅ Production (`/dashboard/farm/production`)
- Check: Stats cards show totals
- Check: Production by milk type breakdown
- Check: Timeline grouped by month
- Scroll: Should see all batches organized chronologically

#### ✅ Inventory (`/dashboard/farm/inventory`)
- Click "Add Item" button
- Fill form: All required fields
- Submit → Should add to table
- Click "Toggle" on any item → Should change availability
- Check: Low stock icons for items <5kg
- Check: Total value calculation

#### ✅ Farm Tours (`/dashboard/farm/tours`)
**Tours Tab:**
- Click "New Tour" button
- Fill form: Title, description, duration, price
- Submit → Should create tour
- Click "Deactivate" → Should change status

**Bookings Tab:**
- Check: Pending bookings show yellow badge
- Click "Approve" on pending → Should change to CONFIRMED
- Click "Decline" on pending → Should change to CANCELLED
- Check: Stats update (pending count, confirmed count, revenue)

#### ✅ Reviews (`/dashboard/farm/reviews`)
- Check: Average rating displays
- Check: Star visualization
- Check: Rating distribution chart
- Check: Reviews list or empty state
- Note: May show empty state if no reviews exist yet

#### ✅ Analytics (`/dashboard/farm/analytics`)
- Check: 4 key metric cards at top
- Check: Monthly production chart (last 6 months)
- Check: Monthly bookings chart (last 6 months)
- Check: Performance summary at bottom
- Verify: All numbers match data from other pages

#### ✅ Settings (`/dashboard/farm/settings`)
- Check: All fields pre-populated with farm data
- Edit: Change farm name
- Edit: Update description
- Change: Phone number
- Click "Save Changes" → Should show success message
- Refresh page → Changes should persist
- Check: Verification status displays
- Check: Lat/long are read-only

### 3. CRUD Operations Test

**Create:**
- [ ] New batch created successfully
- [ ] New inventory item added
- [ ] New tour created
- [ ] Business settings updated

**Read:**
- [ ] All lists load data correctly
- [ ] Stats calculate properly
- [ ] Charts render without errors

**Update:**
- [ ] Inventory availability toggled
- [ ] Tour activated/deactivated
- [ ] Booking approved/declined
- [ ] Settings saved

**Delete:**
- Note: Delete operations not implemented in v1

### 4. UI/UX Checks

**Responsiveness:**
- [ ] Pages look good on desktop
- [ ] Tables are readable
- [ ] Forms are usable
- [ ] Stats cards align properly

**Loading States:**
- [ ] "Loading..." shows while fetching
- [ ] No blank screens
- [ ] Smooth transitions

**Empty States:**
- [ ] Batches shows "No batches yet" with CTA
- [ ] Inventory shows empty table message
- [ ] Tours shows "Create First Tour" button
- [ ] Reviews shows empty state message

**Error Handling:**
- [ ] Failed API calls don't crash page
- [ ] Error messages display when needed
- [ ] Forms validate required fields

**Visual Feedback:**
- [ ] Success messages show on save
- [ ] Status badges use correct colors
- [ ] Progress bars animate
- [ ] Icons display correctly

### 5. Navigation Test
Click through sidebar in this order:
```
Overview → Batches → Production → Inventory → Tours → Reviews → Analytics → Settings → Overview
```
- [ ] All links work
- [ ] Active page highlights in sidebar
- [ ] No 404 errors
- [ ] URLs match expected routes

### 6. Data Consistency
- [ ] Overview stats match individual pages
- [ ] Analytics totals match source data
- [ ] Inventory count matches actual items
- [ ] Tour bookings count is accurate

### 7. Browser Console
- [ ] No TypeScript errors
- [ ] No React warnings
- [ ] No 404 API calls
- [ ] No CORS errors

## Expected API Calls

Each page should make these API calls:

| Page | API Endpoint | Method |
|------|-------------|--------|
| Overview | `/api/batches`, `/api/tours` | GET |
| Batches | `/api/batches` | GET, POST |
| Production | `/api/batches` | GET |
| Inventory | `/api/inventory` | GET, POST, PATCH |
| Tours | `/api/tours`, `/api/bookings` | GET, POST, PATCH |
| Reviews | `/api/reviews` | GET |
| Analytics | `/api/batches`, `/api/inventory`, `/api/bookings` | GET |
| Settings | `/api/businesses/me`, `/api/businesses/:id` | GET, PATCH |

## Known Limitations (v1)
- No batch editing/deletion (create only)
- No inventory item deletion
- No tour deletion
- Reviews API may not exist (graceful fallback)
- No image uploads
- No export functionality
- No real-time updates (manual refresh needed)

## Success Criteria
✅ All 8 pages load without errors
✅ All forms submit successfully
✅ All data displays correctly
✅ Navigation works smoothly
✅ No console errors
✅ Mobile responsive
✅ Empty states show properly
✅ Loading states display

---

**Test Date:** _____________
**Tester:** _____________
**Status:** _____________
**Notes:** _____________
