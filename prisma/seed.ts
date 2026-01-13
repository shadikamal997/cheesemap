import { PrismaClient, UserRole, BusinessType, MilkType, CheeseTexture, SubscriptionPlan } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create French Regions
  const regions = await Promise.all([
    prisma.frenchRegion.create({
      data: {
        name: 'Normandie',
        slug: 'normandie',
        description: 'Home of Camembert and cream-rich cheeses',
        famousCheeses: ['Camembert', 'Pont-l\'Évêque', 'Livarot', 'Neufchâtel'],
        climate: 'Oceanic, mild and humid',
        latitude: 48.8790,
        longitude: 0.1709,
      },
    }),
    prisma.frenchRegion.create({
      data: {
        name: 'Auvergne-Rhône-Alpes',
        slug: 'auvergne-rhone-alpes',
        description: 'Volcanic terroir and mountain cheeses',
        famousCheeses: ['Saint-Nectaire', 'Cantal', 'Bleu d\'Auvergne', 'Reblochon'],
        climate: 'Continental with alpine influences',
        latitude: 45.7167,
        longitude: 3.0833,
      },
    }),
    prisma.frenchRegion.create({
      data: {
        name: 'Bourgogne-Franche-Comté',
        slug: 'bourgogne-franche-comte',
        description: 'Land of Comté and traditional methods',
        famousCheeses: ['Comté', 'Époisses', 'Morbier', 'Mont d\'Or'],
        climate: 'Semi-continental',
        latitude: 47.2805,
        longitude: 4.9994,
      },
    }),
  ]);

  // Create Cheeses
  const cheeses = await Promise.all([
    prisma.cheese.create({
      data: {
        name: 'Camembert de Normandie',
        slug: 'camembert-de-normandie',
        milkType: [MilkType.COW],
        texture: CheeseTexture.SOFT,
        aop: true,
        pdo: true,
        description: 'Iconic soft cheese with bloomy white rind and creamy interior',
        tastingNotes: 'Buttery, earthy, mushroom notes when ripe',
        pairingTips: 'Perfect with fresh baguette, apples, or honey',
        agingTime: 21,
        fatContent: 45,
        strength: 3,
        regionId: regions[0].id,
      },
    }),
    prisma.cheese.create({
      data: {
        name: 'Comté',
        slug: 'comte',
        milkType: [MilkType.COW],
        texture: CheeseTexture.HARD,
        aop: true,
        pdo: true,
        description: 'Mountain cheese with complex nutty flavors',
        tastingNotes: 'Nutty, fruity, hints of caramel and hazelnuts',
        pairingTips: 'Excellent with walnuts, dried fruits, and crusty bread',
        agingTime: 120,
        fatContent: 45,
        strength: 2,
        regionId: regions[2].id,
      },
    }),
    prisma.cheese.create({
      data: {
        name: 'Saint-Nectaire',
        slug: 'saint-nectaire',
        milkType: [MilkType.COW],
        texture: CheeseTexture.SEMI_SOFT,
        aop: true,
        pdo: true,
        description: 'Volcanic terroir cheese with grey-pink rind',
        tastingNotes: 'Earthy, mushroom, walnut flavors',
        pairingTips: 'Pairs perfectly with country bread, grapes, and fresh fruit',
        agingTime: 28,
        fatContent: 45,
        strength: 2,
        regionId: regions[1].id,
      },
    }),
  ]);

  // Create Users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const visitorUser = await prisma.user.create({
    data: {
      email: 'visitor@example.com',
      password: hashedPassword,
      name: 'Marie Dupont',
      role: UserRole.VISITOR,
      language: 'fr',
      country: 'FR',
    },
  });

  const shopUser = await prisma.user.create({
    data: {
      email: 'shop@example.com',
      password: hashedPassword,
      name: 'Jean Fromager',
      role: UserRole.SHOP,
      language: 'fr',
      country: 'FR',
    },
  });

  const farmUser = await prisma.user.create({
    data: {
      email: 'farm@example.com',
      password: hashedPassword,
      name: 'Pierre Producteur',
      role: UserRole.FARM,
      language: 'fr',
      country: 'FR',
    },
  });

  // Create Businesses
  const shopBusiness = await prisma.business.create({
    data: {
      userId: shopUser.id,
      name: 'La Fromagerie Parisienne',
      slug: 'la-fromagerie-parisienne',
      businessType: BusinessType.SHOP,
      description: 'Artisan cheese shop in the heart of Paris',
      story: 'Family-owned since 1985, we curate the finest French cheeses from small producers across France.',
      address: '15 Rue de Seine',
      city: 'Paris',
      postalCode: '75006',
      regionId: regions[0].id,
      latitude: 48.8566,
      longitude: 2.3522,
      phone: '+33 1 42 22 50 45',
      website: 'https://example.com',
      toursEnabled: true,
      deliveryEnabled: true,
      verified: true,
      plan: SubscriptionPlan.PRO,
    },
  });

  const farmBusiness = await prisma.business.create({
    data: {
      userId: farmUser.id,
      name: 'Ferme du Mont d\'Or',
      slug: 'ferme-du-mont-dor',
      businessType: BusinessType.FARM,
      description: 'Traditional mountain farm producing authentic Comté',
      story: 'Our family has been making cheese in the Jura mountains for five generations, respecting ancestral methods.',
      address: 'Route de la Montagne',
      city: 'Métabief',
      postalCode: '25370',
      regionId: regions[2].id,
      latitude: 46.7733,
      longitude: 6.3522,
      phone: '+33 3 81 49 13 81',
      toursEnabled: true,
      deliveryEnabled: true,
      verified: true,
      plan: SubscriptionPlan.STARTER,
    },
  });

  // Create Inventory for Shop
  await prisma.inventoryItem.create({
    data: {
      businessId: shopBusiness.id,
      cheeseId: cheeses[0].id,
      sku: 'CAM-001',
      name: 'Camembert de Normandie AOP',
      description: 'Authentic Normandy Camembert, 250g',
      quantity: 45,
      unit: 'piece',
      price: 850, // €8.50
      available: true,
    },
  });

  await prisma.inventoryItem.create({
    data: {
      businessId: shopBusiness.id,
      cheeseId: cheeses[1].id,
      sku: 'COM-001',
      name: 'Comté 12 months',
      description: 'Aged Comté, 500g portion',
      quantity: 30,
      unit: 'piece',
      price: 1450, // €14.50
      available: true,
    },
  });

  // Create Batch for Farm
  const batch = await prisma.batch.create({
    data: {
      businessId: farmBusiness.id,
      batchNumber: 'BATCH-2024-001',
      milkSource: 'Montbéliarde cows, alpine pastures',
      productionDate: new Date('2024-01-15'),
      agingStartDate: new Date('2024-01-16'),
      targetAgingDays: 120,
      initialQuantity: 40,
      currentQuantity: 38.5,
      unit: 'kg',
      qualityNotes: 'Excellent milk quality, perfect aging conditions',
    },
  });

  // Create Tour
  await prisma.tour.create({
    data: {
      businessId: farmBusiness.id,
      title: 'Comté Cheese Making Experience',
      slug: 'comte-cheese-making-experience',
      description: 'Discover the art of Comté making with a guided tour of our facilities, tasting session, and workshop.',
      type: 'farm visit',
      duration: 120,
      capacity: 12,
      price: 2500, // €25
      availableDays: [1, 2, 3, 4, 5], // Monday to Friday
      startTimes: ['10:00', '14:00'],
      safetyInfo: 'Closed-toe shoes required. Not recommended for children under 6.',
      includedItems: ['Guided tour', 'Tasting of 5 cheeses', 'Workshop participation', 'Take-home sample'],
      status: 'APPROVED',
      active: true,
    },
  });

  // Create Delivery Countries
  await Promise.all([
    prisma.deliveryCountry.create({
      data: {
        countryCode: 'FR',
        countryName: 'France',
        enabled: true,
        baseShippingCost: 750, // €7.50
        estimatedDays: 2,
      },
    }),
    prisma.deliveryCountry.create({
      data: {
        countryCode: 'BE',
        countryName: 'Belgium',
        enabled: true,
        baseShippingCost: 1250, // €12.50
        estimatedDays: 3,
        customsInfo: 'EU member - no customs',
      },
    }),
    prisma.deliveryCountry.create({
      data: {
        countryCode: 'DE',
        countryName: 'Germany',
        enabled: true,
        baseShippingCost: 1450, // €14.50
        estimatedDays: 4,
        customsInfo: 'EU member - no customs',
      },
    }),
  ]);

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
