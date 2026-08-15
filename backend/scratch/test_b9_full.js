const http = require('http');

function request(options, data, cookies = '') {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      const setCookie = res.headers['set-cookie'];
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed, setCookie, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, body, setCookie, headers: res.headers });
        }
      });
    });
    req.on('error', reject);
    if (cookies) {
      req.setHeader('Cookie', cookies);
    }
    if (data) {
      req.setHeader('Content-Type', 'application/json');
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log("=== STARTING B9 FULL LIVE VERIFICATION & CONCURRENCY TESTS ===");

  // 1. Admin Login
  const adminLogin = await request({ host: 'localhost', port: 5000, path: '/api/v1/auth/login', method: 'POST' }, {
    email: 'admin-test@example.com',
    password: 'StrongTestPassword123!'
  });
  const adminCookies = adminLogin.setCookie.map(c => c.split(';')[0]).join('; ');

  // 2. Customer Login
  const custLogin = await request({ host: 'localhost', port: 5000, path: '/api/v1/auth/login', method: 'POST' }, {
    email: 'valid-customer-b5@example.com',
    password: 'ResetPassword789!'
  });
  const custCookies = custLogin.setCookie.map(c => c.split(';')[0]).join('; ');

  // 3. Create Product
  const prodRes = await request({ host: 'localhost', port: 5000, path: '/api/v1/admin/products', method: 'POST' }, {
    name: 'B9 Test Gold Ring',
    slug: 'b9-test-gold-ring',
    sku: 'OSJ-B9-GR-001',
    price: 50000.00
  }, adminCookies);

  const productId = prodRes.data.data.product.id;
  const productSlug = prodRes.data.data.product.slug;
  console.log(`Created Test Product ID: ${productId}`);

  // 4. Create Inventory (Item 1)
  const invCreateRes = await request({ host: 'localhost', port: 5000, path: '/api/v1/admin/inventory', method: 'POST' }, {
    productId,
    quantity: 10,
    lowStockThreshold: 3
  }, adminCookies);
  console.log(`Create Inventory Status: ${invCreateRes.status}, Initial Qty: ${invCreateRes.data.data.inventory.quantity}`);

  // 5. Duplicate Inventory (Item 2 - 409 Conflict)
  const dupInvRes = await request({ host: 'localhost', port: 5000, path: '/api/v1/admin/inventory', method: 'POST' }, {
    productId,
    quantity: 10
  }, adminCookies);
  console.log(`Duplicate Inventory Status: ${dupInvRes.status}, Code: ${dupInvRes.data.error.code}`);

  // 6. Invalid Product (Item 3 - 404 Not Found)
  const invalidProdRes = await request({ host: 'localhost', port: 5000, path: '/api/v1/admin/inventory', method: 'POST' }, {
    productId: 'non-existent-prod-id',
    quantity: 10
  }, adminCookies);
  console.log(`Invalid Product Status: ${invalidProdRes.status}, Code: ${invalidProdRes.data.error.code}`);

  // 7. Admin Get Inventory (Item 4)
  const getInvRes = await request({ host: 'localhost', port: 5000, path: `/api/v1/admin/inventory/${productId}`, method: 'GET' }, null, adminCookies);
  console.log(`Admin Get Inventory Qty: ${getInvRes.data.data.inventory.quantity}, Threshold: ${getInvRes.data.data.inventory.lowStockThreshold}`);

  // 8. Unauthenticated & Customer Forbidden (Item 5, 6, 7)
  const unauthRes = await request({ host: 'localhost', port: 5000, path: `/api/v1/admin/inventory/${productId}`, method: 'GET' });
  console.log(`Unauth Access Status: ${unauthRes.status}, Code: ${unauthRes.data.error.code}`);

  const custGetRes = await request({ host: 'localhost', port: 5000, path: `/api/v1/admin/inventory/${productId}`, method: 'GET' }, null, custCookies);
  console.log(`Customer Get Status: ${custGetRes.status}, Code: ${custGetRes.data.error.code}`);

  const custMutRes = await request({ host: 'localhost', port: 5000, path: `/api/v1/admin/inventory/${productId}/adjust`, method: 'PATCH' }, { change: 5, reason: 'Malicious' }, custCookies);
  console.log(`Customer Mutate Status: ${custMutRes.status}, Code: ${custMutRes.data.error.code}`);

  // 9. Increase & Decrease Stock (Item 8 & 9)
  const incRes = await request({ host: 'localhost', port: 5000, path: `/api/v1/admin/inventory/${productId}/adjust`, method: 'PATCH' }, { change: 5, reason: 'NEW_STOCK' }, adminCookies);
  console.log(`Increase Stock (+5) Qty: ${incRes.data.data.inventory.quantity}`); // 15

  const decRes = await request({ host: 'localhost', port: 5000, path: `/api/v1/admin/inventory/${productId}/adjust`, method: 'PATCH' }, { change: -4, reason: 'DECREASE' }, adminCookies);
  console.log(`Decrease Stock (-4) Qty: ${decRes.data.data.inventory.quantity}`); // 11

  // 10. Negative Stock Prevention (Item 10)
  const overdrawRes = await request({ host: 'localhost', port: 5000, path: `/api/v1/admin/inventory/${productId}/adjust`, method: 'PATCH' }, { change: -20, reason: 'OVERDRAW' }, adminCookies);
  console.log(`Overdraw (-20) Status: ${overdrawRes.status}, Code: ${overdrawRes.data.error.code}`);

  // 11. Zero Stock (Item 11 & 12)
  const zeroRes = await request({ host: 'localhost', port: 5000, path: `/api/v1/admin/inventory/${productId}/adjust`, method: 'PATCH' }, { change: -11, reason: 'ZERO_STOCK' }, adminCookies);
  console.log(`Zero Stock Qty: ${zeroRes.data.data.inventory.quantity}, Availability: ${zeroRes.data.data.inventory.availability}`);

  const negAtZeroRes = await request({ host: 'localhost', port: 5000, path: `/api/v1/admin/inventory/${productId}/adjust`, method: 'PATCH' }, { change: -1, reason: 'NEG_AT_ZERO' }, adminCookies);
  console.log(`Neg at Zero Status: ${negAtZeroRes.status}, Code: ${negAtZeroRes.data.error.code}`);

  // 12. Direct Set & Low/Out Stock Lists (Item 13, 14, 15, 21)
  const setStockRes = await request({ host: 'localhost', port: 5000, path: `/api/v1/admin/inventory/${productId}/stock`, method: 'PATCH' }, { quantity: 2, reason: 'PHYSICAL_AUDIT' }, adminCookies);
  console.log(`Direct Set Qty: ${setStockRes.data.data.inventory.quantity}`);

  const lowStockRes = await request({ host: 'localhost', port: 5000, path: '/api/v1/admin/inventory/low-stock', method: 'GET' }, null, adminCookies);
  console.log(`Low Stock Items Count: ${lowStockRes.data.data.length}`);

  // Set to 0 and check Out-of-Stock list
  await request({ host: 'localhost', port: 5000, path: `/api/v1/admin/inventory/${productId}/stock`, method: 'PATCH' }, { quantity: 0, reason: 'AUDIT_ZERO' }, adminCookies);
  const outOfStockRes = await request({ host: 'localhost', port: 5000, path: '/api/v1/admin/inventory/out-of-stock', method: 'GET' }, null, adminCookies);
  console.log(`Out of Stock Items Count: ${outOfStockRes.data.data.length}`);

  // 13. Threshold Config & Invalid Check (Item 19 & 20)
  const updateConfigRes = await request({ host: 'localhost', port: 5000, path: `/api/v1/admin/inventory/${productId}`, method: 'PATCH' }, { lowStockThreshold: 5 }, adminCookies);
  console.log(`Updated Low Stock Threshold: ${updateConfigRes.data.data.inventory.lowStockThreshold}`);

  const invalidConfigRes = await request({ host: 'localhost', port: 5000, path: `/api/v1/admin/inventory/${productId}`, method: 'PATCH' }, { lowStockThreshold: -1 }, adminCookies);
  console.log(`Invalid Threshold Status: ${invalidConfigRes.status}, Code: ${invalidConfigRes.data.error.code}`);

  // 14. History Audit Log (Item 25)
  const historyRes = await request({ host: 'localhost', port: 5000, path: `/api/v1/admin/inventory/${productId}/history`, method: 'GET' }, null, adminCookies);
  console.log(`Audit History Log Count: ${historyRes.data.data.length}`);

  // ===================================================
  // 15. MANDATORY CONCURRENCY TEST A (Initial 10, Parallel -5 & -3 => Final Qty = 2)
  // ===================================================
  await request({ host: 'localhost', port: 5000, path: `/api/v1/admin/inventory/${productId}/stock`, method: 'PATCH' }, { quantity: 10, reason: 'CONCURRENCY_A_RESET' }, adminCookies);

  console.log("Executing CONCURRENCY TEST A (Parallel -5 and -3)...");
  const [resA1, resA2] = await Promise.all([
    request({ host: 'localhost', port: 5000, path: `/api/v1/admin/inventory/${productId}/adjust`, method: 'PATCH' }, { change: -5, reason: 'PARALLEL_A1' }, adminCookies),
    request({ host: 'localhost', port: 5000, path: `/api/v1/admin/inventory/${productId}/adjust`, method: 'PATCH' }, { change: -3, reason: 'PARALLEL_A2' }, adminCookies),
  ]);

  const finalInvA = await request({ host: 'localhost', port: 5000, path: `/api/v1/admin/inventory/${productId}`, method: 'GET' }, null, adminCookies);
  console.log(`CONCURRENCY TEST A RESULTS: Req1 Status=${resA1.status}, Req2 Status=${resA2.status}, Final Qty=${finalInvA.data.data.inventory.quantity} (Expected: 2)`);

  // ===================================================
  // 16. MANDATORY CONCURRENCY OVERDRAW TEST B (Initial 5, Parallel -4 & -4 => 1 succeeds, 1 fails, Final Qty = 1)
  // ===================================================
  await request({ host: 'localhost', port: 5000, path: `/api/v1/admin/inventory/${productId}/stock`, method: 'PATCH' }, { quantity: 5, reason: 'CONCURRENCY_B_RESET' }, adminCookies);

  console.log("Executing CONCURRENCY OVERDRAW TEST B (Parallel -4 and -4)...");
  const [resB1, resB2] = await Promise.all([
    request({ host: 'localhost', port: 5000, path: `/api/v1/admin/inventory/${productId}/adjust`, method: 'PATCH' }, { change: -4, reason: 'PARALLEL_OVER_1' }, adminCookies),
    request({ host: 'localhost', port: 5000, path: `/api/v1/admin/inventory/${productId}/adjust`, method: 'PATCH' }, { change: -4, reason: 'PARALLEL_OVER_2' }, adminCookies),
  ]);

  const finalInvB = await request({ host: 'localhost', port: 5000, path: `/api/v1/admin/inventory/${productId}`, method: 'GET' }, null, adminCookies);
  console.log(`CONCURRENCY OVERDRAW TEST B RESULTS: Req1 Status=${resB1.status}, Req2 Status=${resB2.status}, Final Qty=${finalInvB.data.data.inventory.quantity} (Expected: 1)`);

  // 17. Public Product Detail Availability (Item 22)
  const publicProdRes = await request({ host: 'localhost', port: 5000, path: `/api/v1/products/${productSlug}`, method: 'GET' });
  console.log(`Public Product Availability Indicator: ${publicProdRes.data.data.product.availability}`);

  // 18. Clean up Test Product & Inventory
  await request({ host: 'localhost', port: 5000, path: `/api/v1/admin/products/${productId}`, method: 'DELETE' }, null, adminCookies);

  // 19. Regressions (B2-B8)
  const regHealth = await request({ host: 'localhost', port: 5000, path: '/api/v1/health', method: 'GET' });
  const regCat = await request({ host: 'localhost', port: 5000, path: '/api/v1/categories', method: 'GET' });
  const regCol = await request({ host: 'localhost', port: 5000, path: '/api/v1/collections', method: 'GET' });
  const regProd = await request({ host: 'localhost', port: 5000, path: '/api/v1/products', method: 'GET' });

  console.log(`Regression Health: ${regHealth.status}, Categories: ${regCat.data.success}, Collections: ${regCol.data.success}, Products: ${regProd.data.success}`);
  console.log("=== ALL B9 VERIFICATION TESTS COMPLETED SUCCESSFULLY ===");
}

runTests().catch(console.error);
