# 🧀 CheeseMap

> **Discover French Cheese, Where It's Made**

CheeseMap is a France-only cheese discovery platform and B2B SaaS application that combines tourism, culture, and e-commerce. Built with Next.js 14, TypeScript, and modern web technologies.

## 🎯 Project Overview

CheeseMap connects cheese lovers with authentic French cheese experiences while providing business owners (shops and farms) with powerful tools to manage their operations, offer tours, and deliver across Europe.

### Key Features

- **🗺️ Interactive Cheese Map** - Explore French cheese shops, farms, and experiences across all regions
- **🏪 B2B SaaS Dashboards** - Role-based dashboards for shops, farms, and visitors
- **📦 Inventory Management** - SKU and batch-based tracking systems
- **🚶 Tour Module** - Book cheese tastings, farm visits, and workshops
- **🚚 EU Delivery** - Cold-chain cheese delivery from France to Europe
- **🎫 French Cheese Passport** - Collect region stamps as you explore
- **💳 Stripe Integration** - Subscriptions, payments, and commission handling
- **🔐 Role-Based Access** - Shop, Farm, Visitor, and Admin roles

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL + Prisma ORM
- **Authentication:** NextAuth.js
- **Maps:** Mapbox GL
- **Payments:** Stripe
- **Deployment:** Vercel-ready

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Mapbox account (for maps)
- Stripe account (for payments)

### Installation

1. **Clone and install dependencies:**

\`\`\`bash
npm install
\`\`\`

2. **Set up environment variables:**

Copy `.env.example` to `.env` and fill in your credentials:

\`\`\`bash
cp .env.example .env
\`\`\`

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Random secret for NextAuth
- `NEXT_PUBLIC_MAPBOX_TOKEN` - Mapbox public token
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret

3. **Set up the database:**

\`\`\`bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npm run db:push

# Seed with French dummy data
npm run db:seed
\`\`\`

4. **Run the development server:**

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

\`\`\`
cheesemap/
├── app/                        # Next.js App Router
│   ├── (public)/              # Public pages (home, map, tours)
│   ├── (auth)/                # Authentication pages
│   ├── (dashboard)/           # Protected dashboard pages
│   ├── admin/                 # Admin panel
│   └── api/                   # API routes
├── components/                # React components
│   ├── ui/                    # Reusable UI components
│   ├── nav/                   # Navigation components
│   ├── map/                   # Map-related components
│   ├── dashboard/             # Dashboard components
│   └── marketing/             # Marketing/landing components
├── lib/                       # Core utilities
│   ├── auth.ts               # NextAuth configuration
│   ├── prisma.ts             # Prisma client
│   ├── stripe.ts             # Stripe configuration
│   └── permissions.ts        # Role-based permissions
├── prisma/                    # Database schema and seed
├── types/                     # TypeScript type definitions
├── utils/                     # Utility functions
└── middleware.ts              # Next.js middleware (auth & geofencing)
\`\`\`

## 👥 User Roles

### 🧀 Cheese Shop / Fromagerie
- SKU-based inventory management
- Order processing and receipts
- Optional tour offerings
- Delivery management

### 🚜 Farm / Producer
- Batch-based production tracking
- Aging management
- Farm tours and visits
- Direct sales

### 👤 Visitor / Tourist
- Cheese discovery and map exploration
- Tour bookings
- French Cheese Passport
- Order tracking

### 🔧 Admin
- Business verification
- Tour approval
- Delivery management
- User administration

## 💰 Pricing Plans

| Plan | Price | Features |
|------|-------|----------|
| **Free** | €0/mo | Profile + Map listing |
| **Starter** | €29/mo | + Inventory & Orders |
| **Pro** | €59/mo | + Tours & Analytics |
| **Premium** | €99/mo | + Promotions & Priority Support |

*Commission: 15% on tours, 10% on delivery orders*

## 🗺️ France-Only Geofencing

CheeseMap enforces France-only business registration:

- Map bounds limited to France coordinates
- Postal code validation (5-digit French format)
- Location verification via coordinates
- Business address must be in France

Delivery is available to selected EU countries.

## 🔐 Authentication

Built with NextAuth.js supporting:
- Email/password authentication
- JWT session strategy
- Role-based access control
- Protected routes via middleware

## 📊 Database Models

Key Prisma models:

- **User** - Authentication and profile
- **Business** - Shop/Farm information
- **FrenchRegion** - Regional data
- **Cheese** - Cheese catalog (AOP/PDO)
- **InventoryItem** - Stock management
- **Batch** - Production tracking
- **Tour** - Experiences and bookings
- **Order** - E-commerce orders
- **Review** - Customer feedback
- **PassportStamp** - Visitor progress

## 🧪 Development Commands

\`\`\`bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Database
npm run db:push          # Push schema changes
npm run db:seed          # Seed dummy data
npm run db:studio        # Open Prisma Studio
\`\`\`

## 🌍 Localization

Supports French (fr) and English (en) with:
- User language preference
- Currency formatting (EUR)
- Date/time localization

## 🚢 Deployment

Optimized for Vercel:

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

Database should be hosted on:
- Vercel Postgres
- Railway
- Supabase
- Or any PostgreSQL provider

## 📝 Dummy Data

The seed script includes:

- 3 French regions (Normandie, Auvergne, Bourgogne)
- 3 famous cheeses (Camembert, Comté, Saint-Nectaire)
- Sample shop and farm businesses
- Inventory items and batches
- Tour example
- EU delivery countries

Test credentials:
- Visitor: `visitor@example.com` / `password123`
- Shop: `shop@example.com` / `password123`
- Farm: `farm@example.com` / `password123`

## 🎨 Design System

Built with Tailwind CSS featuring:
- Orange primary color (#FF6B35)
- Shadcn/ui inspired components
- Responsive design
- Dark mode ready (configured)

## 🔒 Security

- GDPR compliant architecture
- Secure password hashing (bcrypt)
- Protected API routes
- Input validation
- France-only business verification

## 🤝 Contributing

This is a production-ready foundation. To extend:

1. Implement full Mapbox integration
2. Complete all API routes
3. Add email notifications
4. Implement file upload for images
5. Add real-time features
6. Complete mobile responsiveness
7. Add comprehensive testing

## 📄 License

Private project - All rights reserved

## 🎯 Next Steps

1. Configure Mapbox token for interactive maps
2. Set up Stripe products and webhooks
3. Implement email service (SendGrid/Resend)
4. Add file storage (Cloudinary/S3)
5. Complete remaining dashboard pages
6. Add comprehensive testing
7. Deploy to production

---

**Built with ❤️ for French cheese culture**

🧀 CheeseMap - The digital gateway to French cheese
