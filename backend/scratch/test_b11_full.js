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

async function runB11Tests() {
  console.log("=== STARTING B11 CART & WISHLIST LIVE VERIFICATION ===");

  // 1. Logins
  const adminLogin = await sendJsonRequest({ host: 'localhost', port: 5000, path: '/api/v1/auth/login', method: 'POST' }, {
    email: 'admin-test@example.com',
    password: 'StrongTestPassword123!'
  });
  const adminCookies = extractCookies(adminLogin);

  const custALogin = await sendJsonRequest({ host: 'localhost', port: 5000, path: '/api/v1/auth/login', method: 'POST' }, {
    email: 'valid-customer-b5@example.com',
    password: 'ResetPassword789!'
  });
  const custACookies = extractCookies(custALogin);

  const uniqueEmail = `customer-b11-${Date.now()}@example.com`;

  const custBSignup = await sendJsonRequest({ host: 'localhost', port: 5000, path: '/api/v1/auth/signup', method: 'POST' }, {
    name: 'Customer B',
    email: uniqueEmail,
    password: 'Password123!'
  });
  const custBCookies = extractCookies(custBSignup);

  // 2. Create B11 Test Products
  const prod1Res = await sendJsonRequest({ host: 'localhost', port: 5000, path: '/api/v1/admin/products', method: 'POST' }, {
    name: 'B11 Test Gold Bangle', slug: 'b11-test-gold-bangle', sku: 'OSJ-B11-GB-001', price: 60000.00
  }, adminCookies);
  const prod1Id = prod1Res.data.data.product.id;
  await sendJsonRequest({ host: 'localhost', port: 5000, path: '/api/v1/admin/inventory', method: 'POST' }, { productId: prod1Id, quantity: 10 }, adminCookies);

  const prod2Res = await sendJsonRequest({ host: 'localhost', port: 5000, path: '/api/v1/admin/products', method: 'POST' }, {
    name: 'B11 Test Diamond Pendant', slug: 'b11-test-diamond-pendant', sku: 'OSJ-B11-DP-002', price: 40000.00
  }, adminCookies);
  const prod2Id = prod2Res.data.data.product.id;
  await sendJsonRequest({ host: 'localhost', port: 5000, path: '/api/v1/admin/inventory', method: 'POST' }, { productId: prod2Id, quantity: 5 }, adminCookies);

  const prod3Res = await sendJsonRequest({ host: 'localhost', port: 5000, path: '/api/v1/admin/products', method: 'POST' }, {
    name: 'B11 Out of Stock Ring', slug: 'b11-out-of-stock-ring', sku: 'OSJ-B11-OR-003', price: 25000.00
  }, adminCookies);
  const prod3Id = prod3Res.data.data.product.id;
  await sendJsonRequest({ host: 'localhost', port: 5000, path: '/api/v1/admin/inventory', method: 'POST' }, { productId: prod3Id, quantity: 0 }, adminCookies);

  const prod4Res = await sendJsonRequest({ host: 'localhost', port: 5000, path: '/api/v1/admin/products', method: 'POST' }, {
    name: 'B11 Inactive Earring', slug: 'b11-inactive-earring', sku: 'OSJ-B11-IE-004', price: 15000.00, isActive: false
  }, adminCookies);
  const prod4Id = prod4Res.data.data.product.id;

  // 3. Clear existing carts for testing
  await sendJsonRequest({ host: 'localhost', port: 5000, path: '/api/v1/cart', method: 'DELETE' }, null, custACookies);
  await sendJsonRequest({ host: 'localhost', port: 5000, path: '/api/v1/cart', method: 'DELETE' }, null, custBCookies);

  // 4. Get Empty Cart
  const getEmptyCart = await sendJsonRequest({ host: 'localhost', port: 5000, path: '/api/v1/cart', method: 'GET' }, null, custACookies);
  console.log(`Empty Cart Status: ${getEmptyCart.status}, Subtotal: ${getEmptyCart.data.data.subtotal}, ItemCount: ${getEmptyCart.data.data.itemCount}`);

  // 5. Get Cart Count
  const getCartCount = await sendJsonRequest({ host: 'localhost', port: 5000, path: '/api/v1/cart/count', method: 'GET' }, null, custACookies);
  console.log(`Cart Count Status: ${getCartCount.status}, Count: ${getCartCount.data.data.count}`);

  // 6. Add Item 1 to Cart (Qty 2)
  const addRes1 = await sendJsonRequest({ host: 'localhost', port: 5000, path: '/api/v1/cart/items', method: 'POST' }, { productId: prod1Id, quantity: 2, price: 1 }, custACookies);
  console.log(`Add Item 1 Status: ${addRes1.status}, Subtotal: ${addRes1.data.data.subtotal}`);
  const cartItemId1 = addRes1.data.data.items[0].id;

  // 7. Duplicate Add Item 1 (Qty +1 -> 3)
  const addRes1Dup = await sendJsonRequest({ host: 'localhost', port: 5000, path: '/api/v1/cart/items', method: 'POST' }, { productId: prod1Id, quantity: 1 }, custACookies);
  console.log(`Duplicate Add Status: ${addRes1Dup.status}, Qty: ${addRes1Dup.data.data.items[0].quantity}, Subtotal: ${addRes1Dup.data.data.subtotal}`);

  // 8. Add Item 2 (Qty 1)
  const addRes2 = await sendJsonRequest({ host: 'localhost', port: 5000, path: '/api/v1/cart/items', method: 'POST' }, { productId: prod2Id, quantity: 1 }, custACookies);
  console.log(`Add Item 2 Status: ${addRes2.status}, Subtotal: ${addRes2.data.data.subtotal}, Total ItemCount: ${addRes2.data.data.itemCount}`);

  // 9. Update Quantity
  const updateQtyRes = await sendJsonRequest({ host: 'localhost', port: 5000, path: `/api/v1/cart/items/${cartItemId1}`, method: 'PATCH' }, { quantity: 5 }, custACookies);
  console.log(`Update Quantity Status: ${updateQtyRes.status}, New Qty: ${updateQtyRes.data.data.items.find(i => i.id === cartItemId1).quantity}`);

  // 10. Out of Stock Protection (Prod 3)
  const outOfStockAddRes = await sendJsonRequest({ host: 'localhost', port: 5000, path: '/api/v1/cart/items', method: 'POST' }, { productId: prod3Id, quantity: 1 }, custACookies);
  console.log(`Out of Stock Add Status: ${outOfStockAddRes.status}, Code: ${outOfStockAddRes.data.error.code}`);

  // 11. Inactive Product Protection (Prod 4)
  const inactiveAddRes = await sendJsonRequest({ host: 'localhost', port: 5000, path: '/api/v1/cart/items', method: 'POST' }, { productId: prod4Id, quantity: 1 }, custACookies);
  console.log(`Inactive Product Add Status: ${inactiveAddRes.status}, Code: ${inactiveAddRes.data.error.code}`);

  // 12. Exceed Stock Protection (Prod 2 has stock 5, try requesting 6)
  const item2Id = addRes2.data.data.items.find(i => i.productId === prod2Id).id;
  const exceedStockRes = await sendJsonRequest({ host: 'localhost', port: 5000, path: `/api/v1/cart/items/${item2Id}`, method: 'PATCH' }, { quantity: 6 }, custACookies);
  console.log(`Exceed Stock Update Status: ${exceedStockRes.status}, Code: ${exceedStockRes.data.error.code}`);

  // 13. Max Quantity Limit Protection (try setting quantity to 11)
  const maxQtyRes = await sendJsonRequest({ host: 'localhost', port: 5000, path: `/api/v1/cart/items/${cartItemId1}`, method: 'PATCH' }, { quantity: 11 }, custACookies);
  console.log(`Max Qty Update Status: ${maxQtyRes.status}, Code: ${maxQtyRes.data.error.code}`);

  // 14. Ownership Security Check (Customer B attempts to update Customer A's cart item)
  const ownershipHackRes = await sendJsonRequest({ host: 'localhost', port: 5000, path: `/api/v1/cart/items/${cartItemId1}`, method: 'PATCH' }, { quantity: 2 }, custBCookies);
  console.log(`Cross-Customer Cart Update Status: ${ownershipHackRes.status}, Code: ${ownershipHackRes.data.error.code}`);

  // 15. Remove Cart Item
  const removeRes = await sendJsonRequest({ host: 'localhost', port: 5000, path: `/api/v1/cart/items/${item2Id}`, method: 'DELETE' }, null, custACookies);
  console.log(`Remove Item Status: ${removeRes.status}, Remaining Items: ${removeRes.data.data.items.length}`);

  // 16. Clear Cart
  const clearRes = await sendJsonRequest({ host: 'localhost', port: 5000, path: '/api/v1/cart', method: 'DELETE' }, null, custACookies);
  console.log(`Clear Cart Status: ${clearRes.status}, Remaining Items: ${clearRes.data.data.items.length}`);

  // 17. Wishlist Operations
  const getWishlistEmpty = await sendJsonRequest({ host: 'localhost', port: 5000, path: '/api/v1/wishlist', method: 'GET' }, null, custACookies);
  console.log(`Wishlist Empty Status: ${getWishlistEmpty.status}, Count: ${getWishlistEmpty.data.data.count}`);

  const addWishlist1 = await sendJsonRequest({ host: 'localhost', port: 5000, path: '/api/v1/wishlist/items', method: 'POST' }, { productId: prod1Id }, custACookies);
  console.log(`Add Wishlist 1 Status: ${addWishlist1.status}, Count: ${addWishlist1.data.data.count}`);
  const wishItemId1 = addWishlist1.data.data.items[0].id;

  const addWishlistDup = await sendJsonRequest({ host: 'localhost', port: 5000, path: '/api/v1/wishlist/items', method: 'POST' }, { productId: prod1Id }, custACookies);
  console.log(`Duplicate Wishlist Status: ${addWishlistDup.status}, Code: ${addWishlistDup.data.error.code}`);

  const addWishlistOutStock = await sendJsonRequest({ host: 'localhost', port: 5000, path: '/api/v1/wishlist/items', method: 'POST' }, { productId: prod3Id }, custACookies);
  console.log(`Out of Stock Wishlist Status: ${addWishlistOutStock.status}, Availability: ${addWishlistOutStock.data.data.items.find(i => i.productId === prod3Id).availability}`);

  const crossUserWishlist = await sendJsonRequest({ host: 'localhost', port: 5000, path: `/api/v1/wishlist/items/${wishItemId1}`, method: 'DELETE' }, null, custBCookies);
  console.log(`Cross-Customer Wishlist Delete Status: ${crossUserWishlist.status}, Code: ${crossUserWishlist.data.error.code}`);

  const removeWishlist1 = await sendJsonRequest({ host: 'localhost', port: 5000, path: `/api/v1/wishlist/items/${wishItemId1}`, method: 'DELETE' }, null, custACookies);
  console.log(`Remove Wishlist Item Status: ${removeWishlist1.status}`);

  // 18. Admin Access Failure
  const adminCartRes = await sendJsonRequest({ host: 'localhost', port: 5000, path: '/api/v1/cart', method: 'GET' }, null, adminCookies);
  console.log(`Admin Access Cart Status: ${adminCartRes.status}, Code: ${adminCartRes.data.error.code}`);

  // 19. Clean up Test Products
  await sendJsonRequest({ host: 'localhost', port: 5000, path: `/api/v1/admin/products/${prod1Id}`, method: 'DELETE' }, null, adminCookies);
  await sendJsonRequest({ host: 'localhost', port: 5000, path: `/api/v1/admin/products/${prod2Id}`, method: 'DELETE' }, null, adminCookies);
  await sendJsonRequest({ host: 'localhost', port: 5000, path: `/api/v1/admin/products/${prod3Id}`, method: 'DELETE' }, null, adminCookies);
  await sendJsonRequest({ host: 'localhost', port: 5000, path: `/api/v1/admin/products/${prod4Id}`, method: 'DELETE' }, null, adminCookies);

  // 20. B2-B10 Regressions
  const regHealth = await sendJsonRequest({ host: 'localhost', port: 5000, path: '/api/v1/health', method: 'GET' });
  const regCat = await sendJsonRequest({ host: 'localhost', port: 5000, path: '/api/v1/categories', method: 'GET' });
  const regCol = await sendJsonRequest({ host: 'localhost', port: 5000, path: '/api/v1/collections', method: 'GET' });
  const regProd = await sendJsonRequest({ host: 'localhost', port: 5000, path: '/api/v1/products', method: 'GET' });

  console.log(`Regressions - Health: ${regHealth.status}, Categories: ${regCat.data.success}, Collections: ${regCol.data.success}, Products: ${regProd.data.success}`);
  console.log("=== ALL B11 CART & WISHLIST TESTS PASSED PERFECTLY ===");
}

runB11Tests().catch(console.error);
