const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Multi-Tenant Restaurant Platform with Authentic The Pit Cafe Data...');

  // Clean existing records if any
  await prisma.auditLog.deleteMany({});
  await prisma.orderStatusHistory.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.tableSession.deleteMany({});
  await prisma.reservation.deleteMany({});
  await prisma.qRCode.deleteMany({});
  await prisma.table.deleteMany({});
  await prisma.addon.deleteMany({});
  await prisma.addonGroup.deleteMany({});
  await prisma.foodItem.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.discount.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.socialLink.deleteMany({});
  await prisma.restaurant.deleteMany({});

  // 1. Create Flagship: The Pit Cafe (Specific to Rohini Sector 16)
  const thePitCafe = await prisma.restaurant.create({
    data: {
      name: 'The Pit Cafe',
      slug: 'the-pit-cafe',
      tagline: "Rohini's Legendary Biker Courtyard & Late-Night Pitstop",
      description: 'The premier midnight refuel destination in North Delhi. Famed for our viral Pull-Apart Cheesy Garlic Bread, crispy Kurkuri Chaap, fire-grilled Biker Burgers, sizzling Peri Peri Maggi, and chilled thick shakes.',
      aboutText: 'Born in Sector 16 Rohini out of a deep passion for open roads, roaring superbikes, and unapologetically rich comfort food. The Pit Cafe is built as a genuine pitstop: a relaxed open-air courtyard where bikers park their machines right beside the tables, friends pull together under glowing lights, and the kitchen keeps firing fresh, sizzling bites until 5:00 AM.',
      aboutHeading: 'The Story Behind The Pit',
      logoUrl: '/images/pit-cafe-courtyard.jpg',
      heroImageUrl: '/images/pit-cafe-courtyard.jpg',
      storyImageUrl: '/images/pit-cafe-courtyard.jpg',
      heroHeading: 'Late-Night Biker Courtyard & Crave-Worthy Bites',
      heroSubtitle: 'Park your ride in our open-air courtyard, scan your table QR for instant ordering, or pick up a midnight takeaway. Cooking fresh till 5:00 AM.',
      address: 'House 5/114, Pocket 5, Sector 16, Rohini',
      city: 'New Delhi',
      pincode: '110089',
      phone: '+91 97177 80445',
      email: 'thepitcaferohini@gmail.com',
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=THE+PIT+CAFE+Sector+16+Rohini+New+Delhi',
      openingHours: '10:00 AM - 5:00 AM (Late Night)',
      dineInEnabled: true,
      takeawayEnabled: true,
      reservationsEnabled: true,
      maintenanceMode: false,
      taxPercentage: 5.0,
      serviceChargePercentage: 0.0,
      themePrimaryColor: '#F59E0B', // Amber Gold / Racing Orange
      themeSecondaryColor: '#101114',
      themeAccentColor: '#FF6B00',
      themeMode: 'dark',
      welcomeGreetingHeading: 'Welcome to The Pit Cafe!',
      welcomeGreetingMessage: 'You are seated in our courtyard. Browse our midnight kitchen specials and place your order directly from your phone.',
      qrCtaText: 'View Menu & Order',
      policyTitle: 'Zero-Wait Counter Payment',
      policyText: 'All items are prepared fresh to order upon confirmation. Settle your bill at the main counter via UPI, Cash, or Cards whenever you wrap up.',
      footerCopyright: '© 2026 The Pit Cafe, Rohini Sector 16. All rights reserved. Crafted for Bikers & Foodies.',
      socialLinks: {
        create: [
          { platform: 'instagram', url: 'https://www.instagram.com/thepitcafe_rohini_/', label: '@thepitcafe_rohini_', displayOrder: 1 },
          { platform: 'whatsapp', url: 'https://wa.me/919717780445', label: '+91 97177 80445', displayOrder: 2 },
          { platform: 'maps', url: 'https://www.google.com/maps/search/?api=1&query=THE+PIT+CAFE+Sector+16+Rohini+New+Delhi', label: 'Sector 16 Rohini (Google Maps)', displayOrder: 3 },
          { platform: 'phone', url: 'tel:+919717780445', label: 'Call: 9717780445', displayOrder: 4 },
        ],
      },
    },
  });

  // 2. Categories for The Pit Cafe
  const catGarlicBread = await prisma.category.create({
    data: {
      restaurantId: thePitCafe.id,
      name: 'Viral Pull-Apart & Starters',
      slug: 'viral-garlic-bread-starters',
      displayOrder: 1,
      icon: 'Flame',
      description: 'Our internet-famous pull-apart breads, crispy starters, and finger foods',
    },
  });

  const catChaap = await prisma.category.create({
    data: {
      restaurantId: thePitCafe.id,
      name: 'Crispy Chaap & Tandoori Bites',
      slug: 'crispy-chaap-tandoori',
      displayOrder: 2,
      icon: 'UtensilsCrossed',
      description: 'Delhi’s favorite kurkuri and creamy marinated soya chaap creations',
    },
  });

  const catMomos = await prisma.category.create({
    data: {
      restaurantId: thePitCafe.id,
      name: 'Momos Junction',
      slug: 'momos-junction',
      displayOrder: 3,
      icon: 'Sparkles',
      description: 'Steamed, tandoori fried, and extra crunchy kurkure momos with spicy garlic dip',
    },
  });

  const catMaggi = await prisma.category.create({
    data: {
      restaurantId: thePitCafe.id,
      name: 'Signature Maggi Bowls',
      slug: 'signature-maggi',
      displayOrder: 4,
      icon: 'Soup',
      description: 'Late-night street-style, fiery peri-peri, and cheese-smothered Maggi bowls',
    },
  });

  const catBurgers = await prisma.category.create({
    data: {
      restaurantId: thePitCafe.id,
      name: 'The Pit Biker Burgers',
      slug: 'the-pit-biker-burgers',
      displayOrder: 5,
      icon: 'Utensils',
      description: 'Double crunchy patties, brioche buns, molten cheddar, and house smoky mayo',
    },
  });

  const catPizza = await prisma.category.create({
    data: {
      restaurantId: thePitCafe.id,
      name: 'Stone-Oven Pizzas',
      slug: 'stone-oven-pizzas',
      displayOrder: 6,
      icon: 'Pizza',
      description: 'Freshly stretched dough with bubbling mozzarella and zesty toppings',
    },
  });

  const catSandwiches = await prisma.category.create({
    data: {
      restaurantId: thePitCafe.id,
      name: 'Toasts & Grilled Sandwiches',
      slug: 'toasts-sandwiches',
      displayOrder: 7,
      icon: 'Sandwich',
      description: 'Buttery golden grilled toasts packed with seasoned veggies and paneer',
    },
  });

  const catBrews = await prisma.category.create({
    data: {
      restaurantId: thePitCafe.id,
      name: 'Thick Shakes & Chilled Brews',
      slug: 'thick-shakes-brews',
      displayOrder: 8,
      icon: 'Coffee',
      description: 'Dense Belgian chocolate shakes, iced hazelnut coffees, and refreshing mojitos',
    },
  });

  // 3. Authentic Food Items for The Pit Cafe
  const itemsData = [
    // Viral Starters
    {
      categoryId: catGarlicBread.id,
      name: 'Pull-Apart Cheesy Garlic Bread',
      slug: 'pull-apart-cheesy-garlic-bread',
      price: 180,
      description: 'The viral internet sensation! Artisanal sourdough loaf drenched in roasted garlic butter, loaded with stretchy molten mozzarella, and sprinkled with Italian herbs.',
      imageUrl: '/images/pull-apart-garlic-bread.jpg',
      preparationTime: 12,
      isVeg: true,
      isBestseller: true,
      isFeatured: true,
      ingredients: 'Artisan bread, Mozzarella, Minced roasted garlic, Parsley, Chili flakes, Butter',
      allergens: 'Dairy, Gluten',
      searchTags: 'garlic bread, cheese pull, pull apart, mozzarella, cheese garlic bread',
    },
    {
      categoryId: catGarlicBread.id,
      name: 'Peri Peri Crispy French Fries',
      slug: 'peri-peri-crispy-french-fries',
      price: 110,
      description: 'Golden crunchy potato fries tossed in fiery African peri peri seasoning, served with creamy chipotle mayo dip.',
      imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80',
      preparationTime: 8,
      isVeg: true,
      ingredients: 'Potatoes, Peri peri spice blend, Refined oil, Chipotle dip',
      allergens: '',
      searchTags: 'fries, peri peri fries, french fries, chips, potato fries',
    },

    // Chaap
    {
      categoryId: catChaap.id,
      name: 'Kurkuri Soya Chaap Sticks',
      slug: 'kurkuri-soya-chaap-sticks',
      price: 160,
      description: 'Signature house favorite! Juicy soya chaap encased in an ultra-crunchy spiced cornflake batter, dusted with chaat masala, served with laccha onions & green mint chutney.',
      imageUrl: '/images/kurkuri-chaap.jpg',
      preparationTime: 15,
      isVeg: true,
      isBestseller: true,
      isFeatured: true,
      ingredients: 'Soya chaap, Spiced batter, Cornflakes, Chaat masala, Mint chutney, Onions',
      allergens: 'Soy, Gluten',
      searchTags: 'kurkuri chaap, soya chaap, crispy chaap, kurkure chaap, fried chaap',
    },
    {
      categoryId: catChaap.id,
      name: 'Afghani Creamy Malai Chaap',
      slug: 'afghani-creamy-malai-chaap',
      price: 180,
      description: 'Tender tandoor-roasted soya chaap tossed in rich cashew malai, white pepper, melted butter, and fresh coriander.',
      imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80',
      preparationTime: 15,
      isVeg: true,
      ingredients: 'Soya chaap, Fresh cream, Cashew paste, Butter, Cardamom, Herbs',
      allergens: 'Dairy, Nuts, Soy',
      searchTags: 'malai chaap, afghani chaap, creamy chaap, tandoori chaap',
    },

    // Momos
    {
      categoryId: catMomos.id,
      name: 'Signature Kurkure Momos (6 Pcs)',
      slug: 'signature-kurkure-momos',
      price: 140,
      description: 'Crumb-coated extra crunchy fried momos stuffed with seasoned vegetables, served with fiery red chili garlic dip and creamy mayo.',
      imageUrl: '/images/kurkure-momos.jpg',
      preparationTime: 12,
      isVeg: true,
      isBestseller: true,
      isFeatured: true,
      isSpicy: true,
      ingredients: 'Veggie stuffing, Flour wrapper, Crunchy crumb crust, Red chili garlic chutney, Mayo',
      allergens: 'Gluten',
      searchTags: 'kurkure momos, fried momos, crispy momos, momos, dumplings',
    },
    {
      categoryId: catMomos.id,
      name: 'Steamed Paneer Delight Momos (6 Pcs)',
      slug: 'steamed-paneer-delight-momos',
      price: 130,
      description: 'Thin-skinned steamed dumplings filled with soft spiced cottage cheese, spring onions, and roasted coriander seeds.',
      imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80',
      preparationTime: 10,
      isVeg: true,
      ingredients: 'Paneer, Spring onions, Ginger, Coriander, Chili chutney',
      allergens: 'Dairy, Gluten',
      searchTags: 'steamed momos, paneer momos, veg momos',
    },

    // Maggi
    {
      categoryId: catMaggi.id,
      name: 'Peri Peri Tossed Maggi',
      slug: 'peri-peri-tossed-maggi',
      price: 130,
      description: 'The cult favorite midnight snack! Two cakes of noodles tossed in fiery peri-peri spices, sweet corn, crunchy capsicum, and golden butter.',
      imageUrl: '/images/peri-peri-maggi.jpg',
      preparationTime: 10,
      isVeg: true,
      isBestseller: true,
      isFeatured: true,
      isSpicy: true,
      ingredients: 'Maggi noodles, Peri peri seasoning, Sweet corn, Capsicum, Butter',
      allergens: 'Gluten',
      searchTags: 'peri peri maggi, spicy maggi, street maggi, midnight maggi',
    },
    {
      categoryId: catMaggi.id,
      name: 'Cheese Blast Maggi',
      slug: 'cheese-blast-maggi',
      price: 150,
      description: 'Hot bubbling Maggi smothered under a thick blanket of molten mozzarella and cheddar with smoked paprika dust.',
      imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
      preparationTime: 12,
      isVeg: true,
      ingredients: 'Noodles, Double mozzarella, Cheddar, Oregano, Butter',
      allergens: 'Dairy, Gluten',
      searchTags: 'cheese maggi, cheesy maggi, blast maggi',
    },

    // Burgers
    {
      categoryId: catBurgers.id,
      name: 'The Pit Monster Biker Burger',
      slug: 'the-pit-monster-biker-burger',
      price: 220,
      description: 'Towering double crunchy seasoned patties, double molten cheddar cheese, caramelized grilled onions, pickled jalapeños, and smoky chipotle sauce on a toasted sesame brioche bun.',
      imageUrl: '/images/pit-monster-burger.jpg',
      preparationTime: 18,
      isVeg: true,
      isBestseller: true,
      isFeatured: true,
      isSpicy: true,
      ingredients: 'Double crunchy patty, Double cheddar, Brioche bun, Caramelized onions, Jalapenos, Chipotle',
      allergens: 'Dairy, Gluten',
      searchTags: 'monster burger, double burger, biker burger, giant burger, spicy burger',
    },
    {
      categoryId: catBurgers.id,
      name: 'Classic Crisp Veg Burger',
      slug: 'classic-crisp-veg-burger',
      price: 100,
      description: 'Golden spiced potato-herb patty, crisp iceberg lettuce, ripe tomato slices, and secret house burger mayo on a toasted bun.',
      imageUrl: '/images/classic-crisp-veg-burger.jpg',
      preparationTime: 12,
      isVeg: true,
      ingredients: 'Veg patty, Brioche bun, Crisp lettuce, Burger mayo',
      allergens: 'Gluten',
      searchTags: 'veg burger, crisp burger, aloo tikki burger, basic burger',
    },

    // Pizzas
    {
      categoryId: catPizza.id,
      name: 'Farmhouse Rustic Pizza (10-inch)',
      slug: 'farmhouse-rustic-pizza',
      price: 280,
      description: 'Stone-oven baked hand-stretched pizza crust, Italian herb sauce, bell peppers, golden corn, black olives, red onions, and mozzarella.',
      imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
      preparationTime: 18,
      isVeg: true,
      isFeatured: true,
      ingredients: 'Pizza dough, Mozzarella, Bell peppers, Corn, Black olives, Basil',
      allergens: 'Dairy, Gluten',
      searchTags: 'farmhouse pizza, veg pizza, 10 inch pizza, stone oven pizza',
    },
    {
      categoryId: catPizza.id,
      name: 'Tandoori Paneer Tikka Pizza',
      slug: 'tandoori-paneer-tikka-pizza',
      price: 310,
      description: 'Smoky spiced cottage cheese cubes, charred capsicum, red onions, makhani drizzle, and stretchy mozzarella cheese.',
      imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80',
      preparationTime: 18,
      isVeg: true,
      isSpicy: true,
      ingredients: 'Dough, Tandoori paneer, Mozzarella, Makhani sauce, Capsicum',
      allergens: 'Dairy, Gluten',
      searchTags: 'paneer pizza, tandoori pizza, tikka pizza',
    },

    // Sandwiches
    {
      categoryId: catSandwiches.id,
      name: 'Cheese Toast Sandwich',
      slug: 'cheese-toast-sandwich',
      price: 80,
      description: 'Golden toasted bread stuffed with molten mozzarella, cheddar, and Italian herb seasoning.',
      imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80',
      preparationTime: 10,
      isVeg: true,
      ingredients: 'Bread, Mozzarella, Cheddar, Oregano, Butter',
      allergens: 'Dairy, Gluten',
      searchTags: 'cheese toast, grilled cheese, toastie, sandwich',
    },
    {
      categoryId: catSandwiches.id,
      name: 'Paneer Toast Sandwich',
      slug: 'paneer-toast-sandwich',
      price: 100,
      description: 'Tender cottage cheese cubes tossed in tandoori spices and layered between crispy grilled bread.',
      imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80',
      preparationTime: 12,
      isVeg: true,
      ingredients: 'Paneer, Spices, Bell peppers, Butter, Toast',
      allergens: 'Dairy, Gluten',
      searchTags: 'paneer toast, paneer sandwich, cottage cheese sandwich',
    },

    // Thick Shakes & Brews
    {
      categoryId: catBrews.id,
      name: 'Belgian Dark Chocolate Thick Shake',
      slug: 'belgian-dark-chocolate-thick-shake',
      price: 170,
      description: 'Dense Belgian chocolate blended with whole milk and ice cream, topped with whipped cream, dark fudge syrup, and shaved chocolate curls.',
      imageUrl: '/images/belgian-chocolate-shake.jpg',
      preparationTime: 8,
      isVeg: true,
      isBestseller: true,
      isFeatured: true,
      ingredients: 'Belgian dark chocolate, Whole milk, Ice cream, Whipped cream, Chocolate fudge',
      allergens: 'Dairy',
      searchTags: 'chocolate shake, thick shake, belgian shake, milkshake, dessert shake',
    },
    {
      categoryId: catBrews.id,
      name: 'Hazelnut Iced Cold Coffee',
      slug: 'hazelnut-iced-cold-coffee',
      price: 150,
      description: 'Artisanal espresso shot blended with chilled milk, toasted hazelnut syrup, and a scoop of vanilla ice cream.',
      imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80',
      preparationTime: 8,
      isVeg: true,
      ingredients: 'Espresso, Milk, Hazelnut syrup, Ice cream',
      allergens: 'Dairy, Nuts',
      searchTags: 'cold coffee, hazelnut coffee, iced coffee, cold brew, frappe',
    },
  ];

  for (const item of itemsData) {
    const createdItem = await prisma.foodItem.create({
      data: {
        restaurantId: thePitCafe.id,
        ...item,
      },
    });

    // Add customizations for burgers, pizzas, and garlic breads
    if (
      item.categoryId === catBurgers.id ||
      item.categoryId === catPizza.id ||
      item.categoryId === catGarlicBread.id ||
      item.categoryId === catMaggi.id
    ) {
      await prisma.addonGroup.create({
        data: {
          restaurantId: thePitCafe.id,
          foodItemId: createdItem.id,
          title: 'Custom Add-ons & Extras',
          minSelect: 0,
          maxSelect: 4,
          isRequired: false,
          addons: {
            create: [
              { name: 'Extra Stretchy Mozzarella Cheese', price: 40 },
              { name: 'Spiced Paneer Tikka Topping', price: 50 },
              { name: 'Extra Peri Peri Seasoning Dust', price: 20 },
              { name: 'House Dip Duo (Garlic Mayo + Fiery Dip)', price: 30 },
            ],
          },
        },
      });
    }
  }

  // 4. Courtyard & Indoor Tables with QR codes
  const tablesData = [
    { tableNumber: 'T01', slug: 't01', capacity: 2, location: 'Courtyard Biker Deck' },
    { tableNumber: 'T02', slug: 't02', capacity: 4, location: 'Courtyard String Light Patio' },
    { tableNumber: 'T03', slug: 't03', capacity: 4, location: 'Courtyard Central Round' },
    { tableNumber: 'T04', slug: 't04', capacity: 6, location: 'Biker Gang Long Bench' },
    { tableNumber: 'T05', slug: 't05', capacity: 4, location: 'Indoor Lounge Booth' },
    { tableNumber: 'T06', slug: 't06', capacity: 2, location: 'High-Top Bar Counter' },
    { tableNumber: 'T12', slug: 't12', capacity: 6, location: 'VIP Pit Stop Booth' },
  ];

  for (const t of tablesData) {
    const table = await prisma.table.create({
      data: {
        restaurantId: thePitCafe.id,
        tableNumber: t.tableNumber,
        slug: t.slug,
        capacity: t.capacity,
        location: t.location,
        status: 'AVAILABLE',
      },
    });

    await prisma.qRCode.create({
      data: {
        restaurantId: thePitCafe.id,
        tableId: table.id,
        codeUrl: `/r/${thePitCafe.slug}/table/${table.slug}`,
        isActive: true,
      },
    });
  }

  // 5. Promotional Discounts & Coupons
  await prisma.coupon.create({
    data: {
      restaurantId: thePitCafe.id,
      code: 'PITFUEL100',
      description: 'Flat ₹100 off on first order above ₹399',
      discountType: 'FLAT',
      discountValue: 100,
      minOrderValue: 399,
      isActive: true,
    },
  });

  await prisma.coupon.create({
    data: {
      restaurantId: thePitCafe.id,
      code: 'MIDNIGHT15',
      description: '15% off on late-night orders above ₹300',
      discountType: 'PERCENTAGE',
      discountValue: 15,
      minOrderValue: 300,
      maxDiscount: 150,
      isActive: true,
    },
  });

  await prisma.discount.create({
    data: {
      restaurantId: thePitCafe.id,
      title: 'Late Night Rider Treat',
      description: '10% cafe-wide discount on all orders',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      scope: 'ALL',
      minOrderValue: 200,
      maxDiscount: 100,
      isActive: true,
    },
  });

  // 6. Amber Bistro (secondary tenant for multi-tenant proof)
  const amberBistro = await prisma.restaurant.create({
    data: {
      name: 'Amber Bistro',
      slug: 'amber-bistro',
      tagline: 'European Bistro & Artisanal Patisserie',
      description: 'An elegant dining destination specializing in Continental cuisine, wood-fired delights, and freshly baked pastries.',
      address: '42 Connaught Place, Block B',
      city: 'New Delhi',
      pincode: '110001',
      phone: '+91 91234 56789',
      email: 'reservation@amberbistro.com',
      openingHours: '11:00 AM - 11:30 PM',
      dineInEnabled: true,
      takeawayEnabled: true,
      reservationsEnabled: true,
      taxPercentage: 5.0,
      themePrimaryColor: '#B45309',
      themeSecondaryColor: '#18181B',
      themeAccentColor: '#D97706',
      themeMode: 'luxury',
    },
  });

  console.log('Database successfully re-seeded!');
  console.log(`Primary Flagship: ${thePitCafe.name} (/r/${thePitCafe.slug})`);
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
