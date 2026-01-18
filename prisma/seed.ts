import { PrismaClient, PricingTier, SupportLevel, SubscriptionStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // ============================================================================
  // ADMIN USER
  // ============================================================================
  console.log('Creating admin user...');
  const adminPassword = await bcrypt.hash('Admin123!@#', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cheesemap.fr' },
    update: {},
    create: {
      email: 'admin@cheesemap.fr',
      passwordHash: adminPassword,
      role: 'ADMIN',
      firstName: 'Admin',
      lastName: 'CheeseMap',
      emailVerified: true,
      isActive: true,
      locale: 'fr',
      timezone: 'Europe/Paris',
    },
  });
  console.log(`✅ Admin user created: ${admin.email}\n`);

  // ============================================================================
  // DELIVERY ZONES (France + EU Countries)
  // ============================================================================
  console.log('Creating delivery zones...');
  
  const deliveryZones = [
    // France (Priority)
    { countryCode: 'FR', countryName: 'France', isEnabled: true, minOrderAmount: 0, baseDeliveryFee: 5.99, estimatedDaysMin: 1, estimatedDaysMax: 3, requiresCustoms: false },
    
    // EU Countries
    { countryCode: 'BE', countryName: 'Belgium', isEnabled: true, minOrderAmount: 50, baseDeliveryFee: 12.99, estimatedDaysMin: 3, estimatedDaysMax: 5, requiresCustoms: false },
    { countryCode: 'DE', countryName: 'Germany', isEnabled: true, minOrderAmount: 50, baseDeliveryFee: 14.99, estimatedDaysMin: 3, estimatedDaysMax: 6, requiresCustoms: false },
    { countryCode: 'IT', countryName: 'Italy', isEnabled: true, minOrderAmount: 50, baseDeliveryFee: 15.99, estimatedDaysMin: 4, estimatedDaysMax: 7, requiresCustoms: false },
    { countryCode: 'ES', countryName: 'Spain', isEnabled: true, minOrderAmount: 50, baseDeliveryFee: 15.99, estimatedDaysMin: 4, estimatedDaysMax: 7, requiresCustoms: false },
    { countryCode: 'NL', countryName: 'Netherlands', isEnabled: true, minOrderAmount: 50, baseDeliveryFee: 13.99, estimatedDaysMin: 3, estimatedDaysMax: 5, requiresCustoms: false },
    { countryCode: 'LU', countryName: 'Luxembourg', isEnabled: true, minOrderAmount: 40, baseDeliveryFee: 11.99, estimatedDaysMin: 2, estimatedDaysMax: 4, requiresCustoms: false },
    { countryCode: 'AT', countryName: 'Austria', isEnabled: true, minOrderAmount: 50, baseDeliveryFee: 16.99, estimatedDaysMin: 4, estimatedDaysMax: 7, requiresCustoms: false },
    { countryCode: 'PT', countryName: 'Portugal', isEnabled: true, minOrderAmount: 60, baseDeliveryFee: 18.99, estimatedDaysMin: 5, estimatedDaysMax: 8, requiresCustoms: false },
    { countryCode: 'GR', countryName: 'Greece', isEnabled: false, minOrderAmount: 75, baseDeliveryFee: 24.99, estimatedDaysMin: 7, estimatedDaysMax: 10, requiresCustoms: false },
    { countryCode: 'PL', countryName: 'Poland', isEnabled: true, minOrderAmount: 60, baseDeliveryFee: 17.99, estimatedDaysMin: 5, estimatedDaysMax: 8, requiresCustoms: false },
    { countryCode: 'CZ', countryName: 'Czech Republic', isEnabled: true, minOrderAmount: 60, baseDeliveryFee: 17.99, estimatedDaysMin: 5, estimatedDaysMax: 8, requiresCustoms: false },
    { countryCode: 'DK', countryName: 'Denmark', isEnabled: true, minOrderAmount: 60, baseDeliveryFee: 18.99, estimatedDaysMin: 4, estimatedDaysMax: 7, requiresCustoms: false },
    { countryCode: 'SE', countryName: 'Sweden', isEnabled: true, minOrderAmount: 70, baseDeliveryFee: 21.99, estimatedDaysMin: 5, estimatedDaysMax: 9, requiresCustoms: false },
    { countryCode: 'FI', countryName: 'Finland', isEnabled: false, minOrderAmount: 75, baseDeliveryFee: 24.99, estimatedDaysMin: 6, estimatedDaysMax: 10, requiresCustoms: false },
    { countryCode: 'IE', countryName: 'Ireland', isEnabled: true, minOrderAmount: 60, baseDeliveryFee: 19.99, estimatedDaysMin: 5, estimatedDaysMax: 8, requiresCustoms: false },
    { countryCode: 'HU', countryName: 'Hungary', isEnabled: true, minOrderAmount: 60, baseDeliveryFee: 18.99, estimatedDaysMin: 5, estimatedDaysMax: 9, requiresCustoms: false },
    { countryCode: 'RO', countryName: 'Romania', isEnabled: false, minOrderAmount: 75, baseDeliveryFee: 22.99, estimatedDaysMin: 7, estimatedDaysMax: 12, requiresCustoms: false },
    { countryCode: 'BG', countryName: 'Bulgaria', isEnabled: false, minOrderAmount: 75, baseDeliveryFee: 22.99, estimatedDaysMin: 7, estimatedDaysMax: 12, requiresCustoms: false },
    { countryCode: 'HR', countryName: 'Croatia', isEnabled: false, minOrderAmount: 70, baseDeliveryFee: 21.99, estimatedDaysMin: 6, estimatedDaysMax: 10, requiresCustoms: false },
    { countryCode: 'SI', countryName: 'Slovenia', isEnabled: true, minOrderAmount: 60, baseDeliveryFee: 17.99, estimatedDaysMin: 5, estimatedDaysMax: 8, requiresCustoms: false },
    { countryCode: 'SK', countryName: 'Slovakia', isEnabled: true, minOrderAmount: 60, baseDeliveryFee: 17.99, estimatedDaysMin: 5, estimatedDaysMax: 8, requiresCustoms: false },
    { countryCode: 'EE', countryName: 'Estonia', isEnabled: false, minOrderAmount: 75, baseDeliveryFee: 24.99, estimatedDaysMin: 7, estimatedDaysMax: 12, requiresCustoms: false },
    { countryCode: 'LV', countryName: 'Latvia', isEnabled: false, minOrderAmount: 75, baseDeliveryFee: 24.99, estimatedDaysMin: 7, estimatedDaysMax: 12, requiresCustoms: false },
    { countryCode: 'LT', countryName: 'Lithuania', isEnabled: false, minOrderAmount: 75, baseDeliveryFee: 24.99, estimatedDaysMin: 7, estimatedDaysMax: 12, requiresCustoms: false },
    { countryCode: 'CY', countryName: 'Cyprus', isEnabled: false, minOrderAmount: 100, baseDeliveryFee: 34.99, estimatedDaysMin: 10, estimatedDaysMax: 15, requiresCustoms: false },
    { countryCode: 'MT', countryName: 'Malta', isEnabled: false, minOrderAmount: 100, baseDeliveryFee: 34.99, estimatedDaysMin: 10, estimatedDaysMax: 15, requiresCustoms: false },
  ];

  for (const zone of deliveryZones) {
    await prisma.deliveryZone.upsert({
      where: { countryCode: zone.countryCode },
      update: {},
      create: zone,
    });
  }
  console.log(`✅ ${deliveryZones.length} delivery zones created\n`);

  // ============================================================================
  // ACHIEVEMENTS
  // ============================================================================
  console.log('Creating achievements...');
  
  const achievements = [
    // Common Achievements
    { code: 'FIRST_VISIT', name: 'First Steps', description: 'Visit your first fromagerie or farm', iconUrl: '/achievements/first-visit.svg', requirementType: 'STAMPS_COUNT', requirementValue: 1, rarity: 'COMMON' },
    { code: 'FIRST_PURCHASE', name: 'Cheese Lover', description: 'Make your first cheese purchase', iconUrl: '/achievements/first-purchase.svg', requirementType: 'ORDERS_COUNT', requirementValue: 1, rarity: 'COMMON' },
    { code: 'FIRST_REVIEW', name: 'Critic', description: 'Leave your first review', iconUrl: '/achievements/first-review.svg', requirementType: 'REVIEWS_COUNT', requirementValue: 1, rarity: 'COMMON' },
    { code: 'EXPLORER_5', name: 'Local Explorer', description: 'Visit 5 different cheese places', iconUrl: '/achievements/explorer-5.svg', requirementType: 'STAMPS_COUNT', requirementValue: 5, rarity: 'COMMON' },
    
    // Rare Achievements
    { code: 'EXPLORER_10', name: 'Cheese Tourist', description: 'Visit 10 different cheese places', iconUrl: '/achievements/explorer-10.svg', requirementType: 'STAMPS_COUNT', requirementValue: 10, rarity: 'RARE' },
    { code: 'REGIONAL_EXPERT', name: 'Regional Expert', description: 'Visit all cheese places in 3 different regions', iconUrl: '/achievements/regional-expert.svg', requirementType: 'REGIONS_VISITED', requirementValue: 3, rarity: 'RARE' },
    { code: 'AOP_COLLECTOR', name: 'AOP Collector', description: 'Try 10 different AOP cheeses', iconUrl: '/achievements/aop-collector.svg', requirementType: 'AOP_CHEESES_COUNT', requirementValue: 10, rarity: 'RARE' },
    { code: 'FARM_FRIEND', name: 'Farm Friend', description: 'Visit 5 different farms', iconUrl: '/achievements/farm-friend.svg', requirementType: 'FARMS_VISITED', requirementValue: 5, rarity: 'RARE' },
    
    // Epic Achievements
    { code: 'EXPLORER_25', name: 'Cheese Connoisseur', description: 'Visit 25 different cheese places', iconUrl: '/achievements/explorer-25.svg', requirementType: 'STAMPS_COUNT', requirementValue: 25, rarity: 'EPIC' },
    { code: 'TOUR_MASTER', name: 'Tour Master', description: 'Complete 10 farm tours or tastings', iconUrl: '/achievements/tour-master.svg', requirementType: 'TOURS_COMPLETED', requirementValue: 10, rarity: 'EPIC' },
    
    // Legendary Achievements
    { code: 'FRANCE_EXPLORER', name: 'France Explorer', description: 'Visit cheese places in all 13 regions of France', iconUrl: '/achievements/france-explorer.svg', requirementType: 'REGIONS_VISITED', requirementValue: 13, rarity: 'LEGENDARY' },
    { code: 'CHEESE_MASTER', name: 'Maître Fromager', description: 'Visit 50 different cheese places', iconUrl: '/achievements/cheese-master.svg', requirementType: 'STAMPS_COUNT', requirementValue: 50, rarity: 'LEGENDARY' },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { code: achievement.code },
      update: {},
      create: achievement as any,
    });
  }
  console.log(`✅ ${achievements.length} achievements created\n`);

  // ============================================================================
  // TEST BUSINESS ACCOUNTS (Minimal)
  // ============================================================================
  console.log('Creating test business accounts...');
  
  // Shop Owner
  const shopOwnerPassword = await bcrypt.hash('Shop123!@#', 12);
  const shopOwner = await prisma.user.upsert({
    where: { email: 'shop@test.cheesemap.fr' },
    update: {},
    create: {
      email: 'shop@test.cheesemap.fr',
      passwordHash: shopOwnerPassword,
      role: 'SHOP',
      firstName: 'Test',
      lastName: 'Shop',
      emailVerified: true,
      isActive: true,
      locale: 'fr',
      timezone: 'Europe/Paris',
    },
  });

  // Farm Owner
  const farmOwnerPassword = await bcrypt.hash('Farm123!@#', 12);
  const farmOwner = await prisma.user.upsert({
    where: { email: 'farm@test.cheesemap.fr' },
    update: {},
    create: {
      email: 'farm@test.cheesemap.fr',
      passwordHash: farmOwnerPassword,
      role: 'FARM',
      firstName: 'Test',
      lastName: 'Farm',
      emailVerified: true,
      isActive: true,
      locale: 'fr',
      timezone: 'Europe/Paris',
    },
  });

  // Test Shop Business (PENDING status)
  const testShop = await prisma.business.upsert({
    where: { ownerId: shopOwner.id },
    update: {},
    create: {
      ownerId: shopOwner.id,
      type: 'SHOP',
      legalName: 'Fromagerie Test SARL',
      displayName: 'La Fromagerie Test',
      siret: '12345678900001',
      description: 'Test cheese shop for development and testing',
      addressLine1: '1 Rue du Fromage',
      city: 'Paris',
      postalCode: '75001',
      region: 'Île-de-France',
      latitude: 48.8566,
      longitude: 2.3522,
      phone: '+33 1 23 45 67 89',
      email: 'contact@fromagerie-test.fr',
      verificationStatus: 'PENDING',
      isVisible: false,
    },
  });

  // Test Farm Business (PENDING status)
  const testFarm = await prisma.business.upsert({
    where: { ownerId: farmOwner.id },
    update: {},
    create: {
      ownerId: farmOwner.id,
      type: 'FARM',
      legalName: 'Ferme Test Bio EARL',
      displayName: 'La Ferme Test',
      siret: '12345678900002',
      description: 'Test organic farm for development and testing',
      addressLine1: 'Chemin de la Ferme',
      city: 'Reims',
      postalCode: '51100',
      region: 'Grand Est',
      latitude: 49.2583,
      longitude: 4.0317,
      phone: '+33 3 26 12 34 56',
      email: 'contact@ferme-test.fr',
      verificationStatus: 'PENDING',
      isVisible: false,
    },
  });

  console.log(`✅ Test shop created: ${testShop.displayName} (${testShop.verificationStatus})`);
  console.log(`✅ Test farm created: ${testFarm.displayName} (${testFarm.verificationStatus})\n`);

  // ============================================================================
  // PRICING PLANS (AUTHORITATIVE)
  // ============================================================================
  console.log('Creating subscription plans...');
  
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const essentialPlan = await prisma.subscriptionPlan.upsert({
    where: { tier: PricingTier.ESSENTIAL },
    update: {},
    create: {
      tier: PricingTier.ESSENTIAL,
      name: 'Essential',
      description: 'Perfect for starting your cheese business',
      priceEur: 25,
      billingPeriodDays: 30,
      maxProducts: 10,
      maxOrdersPerMonth: 30,
      maxActiveTours: 0,
      hasAnalytics: false,
      hasPromotions: false,
      supportLevel: SupportLevel.STANDARD,
      supportResponseTimeHours: 72,
      isActive: true,
      displayOrder: 0,
    },
  });

  const growthPlan = await prisma.subscriptionPlan.upsert({
    where: { tier: PricingTier.GROWTH },
    update: {},
    create: {
      tier: PricingTier.GROWTH,
      name: 'Growth',
      description: 'For growing cheese businesses',
      priceEur: 55,
      billingPeriodDays: 30,
      maxProducts: 50,
      maxOrdersPerMonth: -1, // unlimited
      maxActiveTours: 5,
      hasAnalytics: true,
      hasPromotions: false,
      supportLevel: SupportLevel.PRIORITY,
      supportResponseTimeHours: 24,
      isActive: true,
      displayOrder: 1,
    },
  });

  const professionalPlan = await prisma.subscriptionPlan.upsert({
    where: { tier: PricingTier.PROFESSIONAL },
    update: {},
    create: {
      tier: PricingTier.PROFESSIONAL,
      name: 'Professional',
      description: 'For established cheese businesses',
      priceEur: 95,
      billingPeriodDays: 30,
      maxProducts: -1, // unlimited
      maxOrdersPerMonth: -1, // unlimited
      maxActiveTours: -1, // unlimited
      hasAnalytics: true,
      hasPromotions: true,
      supportLevel: SupportLevel.DEDICATED,
      supportResponseTimeHours: 1,
      isActive: true,
      displayOrder: 2,
    },
  });

  console.log(`✅ Pricing plans created\n`);

  // ============================================================================
  // SUBSCRIPTIONS FOR TEST BUSINESSES
  // ============================================================================
  console.log('Creating subscriptions for test businesses...');

  // Essential plan for shop (in trial)
  const shopSubscription = await prisma.businessSubscription.upsert({
    where: { businessId: testShop.id },
    update: {},
    create: {
      businessId: testShop.id,
      planId: essentialPlan.id,
      status: SubscriptionStatus.TRIAL,
      trialStartAt: now,
      trialEndAt: thirtyDaysFromNow,
      trialActive: true,
      currentPeriodStart: now,
      currentPeriodEnd: thirtyDaysFromNow,
      nextBillingDate: thirtyDaysFromNow,
      autoRenew: true,
      usage: {
        create: {
          productsCount: 0,
          ordersThisPeriod: 0,
          activeToursCount: 0,
          promotionsUsed: 0,
        },
      },
    },
  });

  // Growth plan for farm (in trial)
  const farmSubscription = await prisma.businessSubscription.upsert({
    where: { businessId: testFarm.id },
    update: {},
    create: {
      businessId: testFarm.id,
      planId: growthPlan.id,
      status: SubscriptionStatus.TRIAL,
      trialStartAt: now,
      trialEndAt: thirtyDaysFromNow,
      trialActive: true,
      currentPeriodStart: now,
      currentPeriodEnd: thirtyDaysFromNow,
      nextBillingDate: thirtyDaysFromNow,
      autoRenew: true,
      usage: {
        create: {
          productsCount: 0,
          ordersThisPeriod: 0,
          activeToursCount: 0,
          promotionsUsed: 0,
        },
      },
    },
  });

  console.log(`✅ Subscriptions created\n`);

  console.log('✅ Database seeding completed!\n');
  console.log('📊 Summary:');
  console.log(`   - Admin user: admin@cheesemap.fr (password: Admin123!@#)`);
  console.log(`   - Test Shop: shop@test.cheesemap.fr (password: Shop123!@#)`);
  console.log(`   - Test Farm: farm@test.cheesemap.fr (password: Farm123!@#)`);
  console.log(`   - Delivery zones: ${deliveryZones.length} countries`);
  console.log(`   - Achievements: ${achievements.length} unlockables`);
  console.log(`   - Businesses: 2 (pending verification)`);
  console.log(`   - Pricing Plans: 3 (Essential, Growth, Professional)`);
  console.log(`   - Subscriptions: 2 (shop: Essential, farm: Growth)`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
