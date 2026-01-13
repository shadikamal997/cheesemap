import { UserRole } from "@prisma/client";

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  language: string;
  country: string;
  emailVerified: Date | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithBusiness extends User {
  business?: Business;
}

export interface Business {
  id: string;
  userId: string;
  name: string;
  slug: string;
  businessType: string;
  description: string | null;
  story: string | null;
  address: string;
  city: string;
  postalCode: string;
  regionId: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  website: string | null;
  toursEnabled: boolean;
  deliveryEnabled: boolean;
  verified: boolean;
  plan: string;
  planExpiresAt: Date | null;
  stripeCustomerId: string | null;
  logo: string | null;
  coverImage: string | null;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}
