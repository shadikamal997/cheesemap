# 🚀 Quick Start Guide

## Initial Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Environment Variables**
   - Copy `.env.example` to `.env`
   - Fill in your credentials (see below)

3. **Database Setup** (Optional - requires PostgreSQL)
   ```bash
   # Generate Prisma Client
   npx prisma generate
   
   # Push schema to database
   npm run db:push
   
   # Seed with French dummy data
   npm run db:seed
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```
   
   Visit [http://localhost:3000](http://localhost:3000)

## 🔑 Required Environment Variables

### Database
```
DATABASE_URL="postgresql://user:password@localhost:5432/cheesemap"
```

### Authentication
```
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-random-secret"
```

Generate a secret:
```bash
openssl rand -base64 32
```

### Mapbox (Optional for development)
```
NEXT_PUBLIC_MAPBOX_TOKEN="pk.your-mapbox-token"
```
Get your token: https://account.mapbox.com/

### Stripe (Optional for development)
```
STRIPE_SECRET_KEY="sk_test_your-key"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your-key"
STRIPE_WEBHOOK_SECRET="whsec_your-secret"
```
Get your keys: https://dashboard.stripe.com/test/apikeys

## 📱 Test Accounts

After seeding the database, you can log in with:

- **Visitor:** `visitor@example.com` / `password123`
- **Shop Owner:** `shop@example.com` / `password123`
- **Farm Owner:** `farm@example.com` / `password123`

## 🧪 Development Without Database

The application will run without a database connection, but:
- Authentication won't work
- Dashboard will show static data
- Map will show a placeholder

This allows you to:
- View all pages and UI
- Test navigation
- Review design and layout
- Work on frontend components

## 📦 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:push      # Push Prisma schema to database
npm run db:seed      # Seed database with dummy data
npm run db:studio    # Open Prisma Studio (database GUI)
```

## 🗂️ Project Structure Overview

```
app/
├── (public)/        # Public pages (map, tours, businesses)
├── (auth)/          # Login & signup flows
├── (dashboard)/     # Protected dashboard
├── admin/           # Admin panel
└── api/             # API routes

components/          # React components
lib/                 # Core utilities
prisma/              # Database schema
types/               # TypeScript types
utils/               # Helper functions
```

## 🎨 Key Pages to Explore

- **/** - Homepage with hero and cheese map preview
- **/map** - Interactive cheese map (placeholder without Mapbox)
- **/businesses** - For Businesses landing page
- **/tours** - Cheese tours and experiences
- **/login** - Sign in page
- **/signup/role** - Multi-step signup (role selection)
- **/dashboard** - Dashboard overview (requires auth)
- **/dashboard/inventory** - Inventory management

## 🔧 Next Steps

1. **Get Mapbox Token** - For interactive map functionality
2. **Set Up Database** - Use Railway, Vercel Postgres, or local PostgreSQL
3. **Configure Stripe** - For payment processing
4. **Customize Content** - Update text, images, and branding
5. **Deploy** - Push to Vercel or your preferred platform

## 🆘 Common Issues

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or let Next.js use another port automatically
```

### Prisma Client Not Generated
```bash
npx prisma generate
```

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

## 📚 Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [NextAuth.js](https://next-auth.js.org/)

## ✅ Production Checklist

Before deploying:
- [ ] Update all environment variables
- [ ] Change `NEXTAUTH_SECRET` to a secure random string
- [ ] Set up production database
- [ ] Configure Stripe webhooks
- [ ] Add real Mapbox token
- [ ] Update `.env.example` with production domains
- [ ] Test all user flows
- [ ] Run `npm run build` successfully

---

**Happy coding! 🧀**
