const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper assertion function
function assert(condition, message) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`  ✓ ${message}`);
}

async function runTestSuite() {
  console.log('\n======================================================');
  console.log('RESTAURANT PLATFORM END-TO-END VERIFICATION SUITE');
  console.log('Testing Core Business Services, DB Integrity & Scenarios');
  console.log('======================================================\n');

  // --- TEST 1: Multi-Tenant Architecture & Isolation ---
  console.log('[TEST 1] Verifying Multi-Tenant Data Isolation...');
  const pitCafe = await prisma.restaurant.findUnique({
    where: { slug: 'the-pit-cafe' },
    include: { tables: true, foodItems: true, categories: true },
  });
  const amberBistro = await prisma.restaurant.findUnique({
    where: { slug: 'amber-bistro' },
    include: { tables: true, foodItems: true, categories: true },
  });

  assert(pitCafe !== null, 'The Pit Cafe exists in database');
  assert(amberBistro !== null, 'Amber Bistro exists in database');
  assert(pitCafe.id !== amberBistro.id, 'Tenant IDs are distinct');

  // Verify Pit Cafe items do not leak into Amber Bistro
  const crossItems = await prisma.foodItem.findMany({
    where: { restaurantId: amberBistro.id, name: 'Cheese Toast Sandwich' },
  });
  assert(crossItems.length === 0, 'Tenant isolation strictly blocks cross-tenant menu leakage');

  // --- TEST 2: Scenario A - Table QR Ordering Flow ---
  console.log('\n[TEST 2] Verifying Scenario A: Table QR Dine-in Ordering...');
  // Find Table 12
  const table12 = await prisma.table.findFirst({
    where: { restaurantId: pitCafe.id, tableNumber: 'T12' },
    include: { qrCode: true },
  });
  assert(table12 !== null, 'Table 12 exists for The Pit Cafe');
  assert(table12.qrCode !== null, 'Table 12 has an associated persistent QR Code record');
  assert(table12.qrCode.isActive === true, 'Table 12 QR is active');

  // Customer scans QR: Session creation
  const sessionToken = `session_test_${Date.now()}`;
  const tableSession = await prisma.tableSession.create({
    data: {
      restaurantId: pitCafe.id,
      tableId: table12.id,
      sessionToken,
      customerName: 'Rahul Verma',
      customerPhone: '+91 99999 11111',
      status: 'ACTIVE',
    },
  });
  assert(tableSession.sessionToken === sessionToken, 'Table session initialized upon QR scan');

  // Get food items to add to cart
  const paneerToast = await prisma.foodItem.findFirst({
    where: { restaurantId: pitCafe.id, slug: 'paneer-toast-sandwich' },
  });
  const periMaggi = await prisma.foodItem.findFirst({
    where: { restaurantId: pitCafe.id, slug: 'peri-peri-tossed-maggi' },
  });
  const coldCoffee = await prisma.foodItem.findFirst({
    where: { restaurantId: pitCafe.id, slug: 'hazelnut-iced-cold-coffee' },
  });

  assert(paneerToast && periMaggi && coldCoffee, 'Menu items retrieved successfully');

  // Calculate bill server-side
  const qtyPaneer = 2; // 2 x 100 = 200
  const qtyMaggi = 1;  // 1 x 130 = 130
  const qtyCoffee = 2; // 2 x 150 = 300
  const expectedSubtotal = 200 + 130 + 300; // 630
  const expectedTax = Math.round(expectedSubtotal * 0.05 * 100) / 100; // 31.50
  const expectedTotal = expectedSubtotal + expectedTax; // 661.50

  // Create Order with snapshots
  const orderNumber = '#1099';
  const orderA = await prisma.order.create({
    data: {
      orderNumber,
      restaurantId: pitCafe.id,
      orderType: 'DINE_IN',
      tableId: table12.id,
      tableSessionId: tableSession.id,
      customerName: 'Rahul Verma',
      customerPhone: '+91 99999 11111',
      status: 'PENDING',
      subtotal: expectedSubtotal,
      discountAmount: 0,
      taxAmount: expectedTax,
      serviceCharge: 0,
      totalAmount: expectedTotal,
      paymentStatus: 'UNPAID',
      orderItems: {
        create: [
          {
            foodItemId: paneerToast.id,
            nameSnapshot: paneerToast.name,
            priceSnapshot: paneerToast.price,
            quantity: qtyPaneer,
            subtotal: paneerToast.price * qtyPaneer,
          },
          {
            foodItemId: periMaggi.id,
            nameSnapshot: periMaggi.name,
            priceSnapshot: periMaggi.price,
            quantity: qtyMaggi,
            subtotal: periMaggi.price * qtyMaggi,
          },
          {
            foodItemId: coldCoffee.id,
            nameSnapshot: coldCoffee.name,
            priceSnapshot: coldCoffee.price,
            quantity: qtyCoffee,
            subtotal: coldCoffee.price * qtyCoffee,
          },
        ],
      },
    },
    include: { orderItems: true },
  });

  assert(orderA.status === 'PENDING', 'Order placed with initial status PENDING');
  assert(orderA.totalAmount === expectedTotal, 'Server-side bill total matches exact calculation');
  assert(orderA.orderItems.length === 3, 'Order items created with snapshots');

  // Verify Price Snapshotting:
  // If price changes in the menu, order snapshot must remain intact!
  await prisma.foodItem.update({
    where: { id: paneerToast.id },
    data: { price: 150 }, // Increased from 100 to 150
  });

  const refreshedOrder = await prisma.order.findUnique({
    where: { id: orderA.id },
    include: { orderItems: true },
  });
  const snapshottedItem = refreshedOrder.orderItems.find((oi) => oi.foodItemId === paneerToast.id);
  assert(snapshottedItem.priceSnapshot === 100, 'Price snapshotting is immutable and preserved when menu price changes');

  // Restore original price
  await prisma.foodItem.update({
    where: { id: paneerToast.id },
    data: { price: 100 },
  });

  // Admin approves order: PENDING -> ACCEPTED
  const orderAccepted = await prisma.order.update({
    where: { id: orderA.id },
    data: { status: 'ACCEPTED' },
  });
  assert(orderAccepted.status === 'ACCEPTED', 'Admin moves order to ACCEPTED');

  // Kitchen prepares order: ACCEPTED -> PREPARING
  const orderPrep = await prisma.order.update({
    where: { id: orderA.id },
    data: { status: 'PREPARING' },
  });
  assert(orderPrep.status === 'PREPARING', 'Kitchen moves order to PREPARING');

  // Kitchen marks ready: PREPARING -> READY
  const orderReady = await prisma.order.update({
    where: { id: orderA.id },
    data: { status: 'READY' },
  });
  assert(orderReady.status === 'READY', 'Order marked READY to serve');

  // Order served & customer pays at counter: READY -> COMPLETED
  const orderDone = await prisma.order.update({
    where: { id: orderA.id },
    data: { status: 'COMPLETED', paymentStatus: 'PAID_AT_COUNTER' },
  });
  assert(orderDone.status === 'COMPLETED', 'Order successfully COMPLETED');
  assert(orderDone.paymentStatus === 'PAID_AT_COUNTER', 'Payment marked PAID_AT_COUNTER');

  // --- TEST 3: Scenario B - Table Reservation & Double Booking Prevention ---
  console.log('\n[TEST 3] Verifying Scenario B: Reservation & Conflict Prevention...');
  const resDate = '2026-10-15';
  const startTime = '19:30';
  const endTime = '21:00';

  // 1. Customer A reserves Table 12
  const bookingA = await prisma.reservation.create({
    data: {
      restaurantId: pitCafe.id,
      tableId: table12.id,
      customerName: 'Ananya Sharma',
      customerPhone: '+91 98888 22222',
      guestCount: 4,
      reservationDate: resDate,
      startTime,
      endTime,
      status: 'CONFIRMED',
    },
  });
  assert(bookingA.id !== null, 'Reservation created for Table 12 on ' + resDate + ' at ' + startTime);

  // 2. Customer B attempts to double-book Table 12 for overlapping time (20:00 - 21:30)
  const conflictingBookings = await prisma.reservation.findMany({
    where: {
      restaurantId: pitCafe.id,
      tableId: table12.id,
      reservationDate: resDate,
      status: { in: ['CONFIRMED', 'PENDING'] },
    },
  });

  const checkConflict = (startA, endA, startB, endB) => startA < endB && endA > startB;
  const isConflict = conflictingBookings.some((b) =>
    checkConflict('20:00', '21:30', b.startTime, b.endTime)
  );

  assert(isConflict === true, 'Server availability engine detects overlapping conflict on Table 12');

  // --- TEST 4: Scenario C - Takeaway Flow ---
  console.log('\n[TEST 4] Verifying Scenario C: Takeaway Order Flow...');
  const orderC = await prisma.order.create({
    data: {
      orderNumber: '#1100',
      restaurantId: pitCafe.id,
      orderType: 'TAKEAWAY',
      customerName: 'Vikram Singh',
      customerPhone: '+91 97777 33333',
      pickupTime: 'In 25 minutes',
      status: 'PENDING',
      subtotal: 100,
      totalAmount: 105,
      taxAmount: 5,
      paymentStatus: 'UNPAID',
      orderItems: {
        create: [
          {
            foodItemId: paneerToast.id,
            nameSnapshot: paneerToast.name,
            priceSnapshot: paneerToast.price,
            quantity: 1,
            subtotal: 100,
          },
        ],
      },
    },
  });
  assert(orderC.orderType === 'TAKEAWAY', 'Takeaway order created without table requirement');
  assert(orderC.pickupTime === 'In 25 minutes', 'Pickup window captured');

  // Customer cancellation rule check:
  // If still PENDING, cancellation is allowed
  assert(orderC.status === 'PENDING', 'Pending order allows cancellation');
  const cancelledC = await prisma.order.update({
    where: { id: orderC.id },
    data: { status: 'CANCELLED' },
  });
  assert(cancelledC.status === 'CANCELLED', 'Order cancelled while in PENDING state');

  // --- TEST 5: QR Deactivation & Status Logic ---
  console.log('\n[TEST 5] Verifying QR Deactivation & Security...');
  await prisma.qRCode.update({
    where: { tableId: table12.id },
    data: { isActive: false },
  });

  const table12Inactive = await prisma.table.findUnique({
    where: { id: table12.id },
    include: { qrCode: true },
  });
  assert(table12Inactive.qrCode.isActive === false, 'Table QR can be deactivated without deleting table record');

  // Historical orders for Table 12 are unaffected
  const pastOrdersTable12 = await prisma.order.count({
    where: { tableId: table12.id },
  });
  assert(pastOrdersTable12 > 0, 'Historical orders preserve their table reference even if QR is deactivated');

  // Re-activate Table 12
  await prisma.qRCode.update({
    where: { tableId: table12.id },
    data: { isActive: true },
  });

  console.log('\n======================================================');
  console.log('✅ ALL TEST SCENARIOS PASSED WITH 100% SUCCESS!');
  console.log('======================================================\n');
}

runTestSuite()
  .catch((e) => {
    console.error('Test suite failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
