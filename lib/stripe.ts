import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
});

// Pricing plans in cents (EUR)
export const PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    features: ['Profile + Map', 'Basic listing', 'Customer reviews'],
  },
  STARTER: {
    name: 'Starter',
    price: 2900, // €29
    priceId: process.env.STRIPE_STARTER_PRICE_ID,
    features: ['Everything in Free', 'Inventory management', 'Order processing'],
  },
  PRO: {
    name: 'Pro',
    price: 5900, // €59
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    features: ['Everything in Starter', 'Tour bookings', 'Analytics dashboard'],
  },
  PREMIUM: {
    name: 'Premium',
    price: 9900, // €99
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID,
    features: ['Everything in Pro', 'Promotions', 'Priority support'],
  },
};

// Commission rates
export const COMMISSION_RATES = {
  TOURS: 0.15, // 15% on tour bookings
  DELIVERY: 0.10, // 10% on delivery orders
};
