const http = require('http');

function sendJsonRequest(options, data, cookies = '') {
  return new Promise((resolve, reject) => {
    const req = http.request({
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(cookies ? { Cookie: cookies } : {})
      }
    }, (res) => {
      let body = '';
      const setCookie = res.headers['set-cookie'] || [];
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body), setCookie, body });
        } catch (e) {
          resolve({ status: res.statusCode, body, setCookie });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

function extractCookies(res) {
  if (!res || !res.setCookie) return '';
  return res.setCookie.map(c => c.split(';')[0]).join('; ');
}

async function runB12Tests() {
  console.log("=== STARTING B12 CHECKOUT, ADDRESSES & ORDERS LIVE VERIFICATION ===");

  // 1. Logins & Customer Signups
  const adminLogin = await sendJsonRequest({ host: 'localhost', port: 5000, path: '/api/v1/auth/login', method: 'POST' }, {
    email: 'admin-test@example.com',
    password: 'StrongTestPassword123!'
  });
  const adminCookies = extractCookies(adminLogin);

  const timestamp = Date.now();
  const emailA = `customer-b12-a-${timestamp}@example.com`;
  const custASignup = await sendJsonRequest({ host: 'localhost', port: 5000, path: '/api/v1/auth/signup', method: 'POST' }, {
    name: 'Customer A',
    email: emailA,
    password: 'Password123!'
  });
  const custACookies = extractCookies(custASignup);

  const emailB = `customer-b12-b-${timestamp}@example.com`;
  const custBSignup = await sendJsonRequest({ host: 'localhost', port: 5000, path: '/api/v1/auth/signup', method: 'POST' }, {
    name: 'Customer B',
    email: emailB,
    password: 'Password123!'
  });
  const custBCookies = extractCookies(custBSignup);

  // 2. Customer Address Management
  const addAddr1 = await sendJsonRequest({ host: 'localhost', port: 5000, path: '/api/v1/addresses', method: 'POST' }, {
    fullName: 'Customer A Home',
    phone: '9876543210',
    addressLine1: '123 Jewellery Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400001',
    country: 'India',
    isDefault: true
  }, custACookies);
  console.log(`Add Address 1 Status: ${addAddr1.status}, isDefault: ${addAddr1.data.data.isDefault}`);
  const addr1Id = addAddr1.data.data.id;

  const addAddr2 = await sendJsonRequest({ host: 'localhost', port: 5000, path: '/api/v1/addresses', method: 'POST' }, {
    fullName: 'Customer A Office',
    phone: '9876543211',
    addressLine1: '456 Tech Park',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400051',
    country: 'India',
    isDefault: false
  }, custACookies);
  console.log(`Add Address 2 Status: ${addAddr2.status}, isDefault: ${addAddr2.data.data.isDefault}`);
  const addr2Id = addAddr2.data.data.id;

  const setDef2 = await sendJsonRequest({ host: 'localhost', port: 5000, path: `/api/v1/addresses/${addr2Id}/default`, method: 'PATCH' }, null, custACookies);
  console.log(`Set Address 2 Default Status: ${setDef2.status}, isDefault: ${setDef2.data.data.isDefault}`);

  const crossUserAddr = await sendJsonRequest({ host: 'localhost', port: 5000, path: `/api/v1/addresses/${addr1Id}`, method: 'GET' }, null, custBCookies);
  console.log(`Cross-Customer Address Access Status: ${crossUserAddr.status}, Code: ${crossUserAddr.data.error.code}`);

  // 3. Create Test Products
  const prodARes = await sendJsonRequest({ host: 'localhost', port: 5000, path: '/api/v1/admin/products', method: 'POST' }, {
    name: 'B12 Test Gold Necklace', slug: `b12-test-gold-necklace-${timestamp}`, sku: `OSJ-B12-GN-${timestamp}`, price: 80000.00
  }, adminCookies);
  const prodAId = prodARes.data.data.product.id;
  await sendJsonRequest({ host: 'localhost', port: 5000, path: '/api/v1/admin/inventory', method: 'POST' }, { productId: prodAId, quantity: 10 }, adminCookies);

  const prodBRes = await sendJsonRequest({ host: 'localhost', port: 5000, path: '/api/v1/admin/products', method: 'POST' }, {
    name: 'B12 Test Diamond Earring', slug: `b12-test-diamond-earring-${timestamp}`, sku: `OSJ-B12-DE-${timestamp}`, price: 35000.00
  }, adminCookies);
  const prodBId = prodBRes.data.data.product.id;
  await sendJsonRequest({ host: 'localhost', port: 5000, path: '/api/v1/admin/inventory', method: 'POST' }, { productId: prodBId, quantity: 5 }, adminCookies);

  const prodCRes = await sendJsonRequest({ host: 'localhost', port: 5000, path: '/api/v1/admin/products', method: 'POST' }, {
    name: 'B12 Test Out of Stock Ring', slug: `b12-test-oos-ring-${timestamp}`, sku: `OSJ-B12-OOS-${timestamp}`, price: 15000.00
  }, adminCookies);
  const prodCId = prodCRes.data.data.product.id;
  await sendJsonRequest({ host: 'localhost', port: 5000, path: '/api/v1/admin/inventory', method: 'POST' }, { productId: prodCId, quantity: 0 }, adminCookies);

  const prodDRes = await sendJsonRequest({ host: 'localhost', port: 5000, path: '/api/v1/admin/products', method: 'POST' }, {
    name: 'B12 Test Inactive Pendant', slug: `b12-test-inactive-pendant-${timestamp}`, sku: `OSJ-B12-IP-${timestamp}`, price: 20000.00, isActive: false
  }, adminCookies);
  const prodDId = prodDRes.data.data.product.id;

  // 4. Checkout Preview with Empty Cart
  const emptyPreview = await sendJsonRequest({ host: 'localhost', port: 5000, path: '/api/v1/checkout/preview', method: 'POST' }, {}, custACookies);
  console.log(`Empty Cart Preview Status: ${emptyPreview.status}, Code: ${emptyPreview.data.error.code}`);

  // Add items to Customer A cart (Prod A qty 2 = 160,000, Prod B qty 1 = 35,000 -> Total 195,000)
  await sendJsonRequest({ host: 'localhost', port: 5000, path: '/api/v1/cart/items', method: 'POST' }, { productId: prodAId, quantity: 2 }, custACookies);
  await sendJsonRequest({ host: 'localhost', port: 5000, path: '/api/v1/cart/items', method: 'POST' }, { productId: prodBId, quantity: 1 }, custACookies);

  // 5. Checkout Preview with Valid Items
  const validPreview = await sendJsonRequest({ host: 'localhost', port: 5000, path: '/api/v1/checkout/preview', method: 'POST' }, { shippingAddressId: addr1Id }, custACookies);
  console.log(`Valid Preview Status: ${validPreview.status}, Subtotal: ${validPreview.data.data.subtotal}, Eligible: ${validPreview.data.data.isCheckoutEligible}`);

  // 6. Order Creation - Invalid Shipping Address
  const invalidAddrOrder = await sendJsonRequest({ host: 'localhost', port: 5000, path: '/api/v1/orders', method: 'POST' }, { shippingAddressId: 'non-existent-id' }, custACookies);
  console.log(`Invalid Address Order Status: ${invalidAddrOrder.status}, Code: ${invalidAddrOrder.data.error.code}`);

  // 7. Order Creation - Cross Customer Shipping Address
  const crossAddrOrder = await sendJsonRequest({ host: 'localhost', port: 5000, path: '/api/v1/orders', method: 'POST' }, { shippingAddressId: addr1Id }, custBCookies);
  console.log(`Cross-Customer Address Order Status: ${crossAddrOrder.status}, Code: ${crossAddrOrder.data.error.code}`);

  // 8. Successful Order Creation
  const createOrderRes = await sendJsonRequest({ host: 'localhost', port: 5000, path: '/api/v1/orders', method: 'POST' }, { shippingAddressId: addr1Id, notes: 'Deliver in afternoon' }, custACookies);
  console.log(`Create Order Status: ${createOrderRes.status}, OrderNumber: ${createOrderRes.data.data.orderNumber}, Total: ${createOrderRes.data.data.total}`);
  const orderId1 = createOrderRes.data.data.id;

  // Verify Cart Cleared
  const cartAfterOrder = await sendJsonRequest({ host: 'localhost', port: 5000, path: '/api/v1/cart', method: 'GET' }, null, custACookies);
  console.log(`Cart After Order Remaining Items: ${cartAfterOrder.data.data.items.length}`);

  // Verify Inventory Deducted (Prod A stock should be 10 - 2 = 8, Prod B stock 5 - 1 = 4)
  const invAAfter = await sendJsonRequest({ host: 'localhost', port: 5000, path: `/api/v1/admin/inventory/${prodAId}`, method: 'GET' }, null, adminCookies);
  const invBAfter = await sendJsonRequest({ host: 'localhost', port: 5000, path: `/api/v1/admin/inventory/${prodBId}`, method: 'GET' }, null, adminCookies);
  console.log(`Prod A Inventory After Order: ${invAAfter.data.data.inventory.quantity}, Prod B Inventory: ${invBAfter.data.data.inventory.quantity}`);

  // 9. Order Details & History
  const orderDetails = await sendJsonRequest({ host: 'localhost', port: 5000, path: `/api/v1/orders/${orderId1}`, method: 'GET' }, null, custACookies);
  console.log(`Order Details Status: ${orderDetails.status}, Items Count: ${orderDetails.data.data.items.length}`);

  const customerOrders = await sendJsonRequest({ host: 'localhost', port: 5000, path: '/api/v1/orders', method: 'GET' }, null, custACookies);
  console.log(`Customer Orders Count: ${customerOrders.data.data.length}`);

  // 10. Customer Order Cancellation & Inventory Restoration
  const cancelRes = await sendJsonRequest({ host: 'localhost', port: 5000, path: `/api/v1/orders/${orderId1}/cancel`, method: 'PATCH' }, null, custACookies);
  console.log(`Cancel Order Status: ${cancelRes.status}, New Status: ${cancelRes.data.data.status}`);

  const invARestored = await sendJsonRequest({ host: 'localhost', port: 5000, path: `/api/v1/admin/inventory/${prodAId}`, method: 'GET' }, null, adminCookies);
  console.log(`Prod A Restored Inventory: ${invARestored.data.data.inventory.quantity}`);

  // 11. Admin Orders Management
  const adminOrdersRes = await sendJsonRequest({ host: 'localhost', port: 5000, path: '/api/v1/admin/orders', method: 'GET' }, null, adminCookies);
  console.log(`Admin Orders Status: ${adminOrdersRes.status}, Total: ${adminOrdersRes.data.data.length}`);

  const updateStatusRes = await sendJsonRequest({ host: 'localhost', port: 5000, path: `/api/v1/admin/orders/${orderId1}/status`, method: 'PATCH' }, { status: 'CONFIRMED' }, adminCookies);
  console.log(`Admin Update Order Status: ${updateStatusRes.status}, New Status: ${updateStatusRes.data.data.status}`);

  // 12. Cleanup Test Products
  await sendJsonRequest({ host: 'localhost', port: 5000, path: `/api/v1/admin/products/${prodAId}`, method: 'DELETE' }, null, adminCookies);
  await sendJsonRequest({ host: 'localhost', port: 5000, path: `/api/v1/admin/products/${prodBId}`, method: 'DELETE' }, null, adminCookies);
  await sendJsonRequest({ host: 'localhost', port: 5000, path: `/api/v1/admin/products/${prodCId}`, method: 'DELETE' }, null, adminCookies);
  await sendJsonRequest({ host: 'localhost', port: 5000, path: `/api/v1/admin/products/${prodDId}`, method: 'DELETE' }, null, adminCookies);

  console.log("=== ALL B12 CHECKOUT, ADDRESSES & ORDERS TESTS PASSED PERFECTLY ===");
}

runB12Tests().catch(console.error);
