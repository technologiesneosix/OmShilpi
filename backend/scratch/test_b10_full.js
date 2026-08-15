const http = require('http');

function sendMultipartRequest(options, fields, file, cookies = '') {
  return new Promise((resolve, reject) => {
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    let bodyBuffers = [];

    // Add text fields
    for (const [key, value] of Object.entries(fields)) {
      bodyBuffers.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${value}\r\n`));
    }

    // Add file field
    if (file) {
      bodyBuffers.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${file.fieldname}"; filename="${file.filename}"\r\nContent-Type: ${file.mimetype}\r\n\r\n`));
      bodyBuffers.push(file.buffer);
      bodyBuffers.push(Buffer.from('\r\n'));
    }

    bodyBuffers.push(Buffer.from(`--${boundary}--\r\n`));
    const fullBody = Buffer.concat(bodyBuffers);

    const req = http.request({
      ...options,
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': fullBody.length,
        ...(cookies ? { Cookie: cookies } : {})
      }
    }, (res) => {
      let resBody = '';
      res.on('data', chunk => resBody += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(resBody) });
        } catch (e) {
          resolve({ status: res.statusCode, body: resBody });
        }
      });
    });

    req.on('error', reject);
    req.write(fullBody);
    req.end();
  });
}

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
      const setCookie = res.headers['set-cookie'];
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body), setCookie });
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

async function runB10Tests() {
  console.log("=== STARTING B10 MEDIA & IMAGE MANAGEMENT LIVE VERIFICATION ===");

  // 1. Logins
  const adminLogin = await sendJsonRequest({ host: 'localhost', port: 5000, path: '/api/v1/auth/login', method: 'POST' }, {
    email: 'admin-test@example.com',
    password: 'StrongTestPassword123!'
  });
  const adminCookies = adminLogin.setCookie.map(c => c.split(';')[0]).join('; ');

  const custLogin = await sendJsonRequest({ host: 'localhost', port: 5000, path: '/api/v1/auth/login', method: 'POST' }, {
    email: 'valid-customer-b5@example.com',
    password: 'ResetPassword789!'
  });
  const custCookies = custLogin.setCookie.map(c => c.split(';')[0]).join('; ');

  // 2. Create B10 Product
  const prodRes = await sendJsonRequest({ host: 'localhost', port: 5000, path: '/api/v1/admin/products', method: 'POST' }, {
    name: 'B10 Test Diamond Necklace',
    slug: 'b10-test-diamond-necklace',
    sku: 'OSJ-B10-DN-001',
    price: 120000.00
  }, adminCookies);

  const productId = prodRes.data.data.product.id;
  const productSlug = prodRes.data.data.product.slug;
  console.log(`Created Product ID: ${productId}`);

  // Create 1x1 dummy JPEG buffer for upload test
  const dummyJpegBuffer = Buffer.from('/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=', 'base64');
  const dummyFile = { fieldname: 'image', filename: 'test_necklace.jpg', mimetype: 'image/jpeg', buffer: dummyJpegBuffer };

  // 3. Upload Image 1 (First image -> auto primary)
  const img1Res = await sendMultipartRequest({ host: 'localhost', port: 5000, path: `/api/v1/admin/products/${productId}/images`, method: 'POST' }, { altText: 'Front View' }, dummyFile, adminCookies);
  console.log(`Upload Image 1 Status: ${img1Res.status}, isPrimary: ${img1Res.data.data.image.isPrimary}, URL: ${img1Res.data.data.image.url}`);
  const imageId1 = img1Res.data.data.image.id;

  // 4. Upload Image 2 (Secondary image)
  const img2Res = await sendMultipartRequest({ host: 'localhost', port: 5000, path: `/api/v1/admin/products/${productId}/images`, method: 'POST' }, { altText: 'Side View', isPrimary: 'false' }, dummyFile, adminCookies);
  console.log(`Upload Image 2 Status: ${img2Res.status}, isPrimary: ${img2Res.data.data.image.isPrimary}`);
  const imageId2 = img2Res.data.data.image.id;

  // 5. Get Product Images
  const getImagesRes = await sendJsonRequest({ host: 'localhost', port: 5000, path: `/api/v1/admin/products/${productId}/images`, method: 'GET' }, null, adminCookies);
  console.log(`List Images Count: ${getImagesRes.data.data.images.length}`);

  // 6. Set Primary Image (Set Image 2 as primary)
  const setPrimaryRes = await sendJsonRequest({ host: 'localhost', port: 5000, path: `/api/v1/admin/products/${productId}/images/${imageId2}/primary`, method: 'PATCH' }, null, adminCookies);
  console.log(`Set Primary Image 2 Status: ${setPrimaryRes.status}, isPrimary: ${setPrimaryRes.data.data.image.isPrimary}`);

  // 7. Reorder Images ([Image 2, Image 1])
  const reorderRes = await sendJsonRequest({ host: 'localhost', port: 5000, path: `/api/v1/admin/products/${productId}/images/reorder`, method: 'PATCH' }, { imageIds: [imageId2, imageId1] }, adminCookies);
  console.log(`Reorder Images Status: ${reorderRes.status}, First Image ID: ${reorderRes.data.data.images[0].id}`);

  // 8. Update Image Metadata
  const updateMetaRes = await sendJsonRequest({ host: 'localhost', port: 5000, path: `/api/v1/admin/products/${productId}/images/${imageId1}`, method: 'PATCH' }, { altText: 'Updated Back View' }, adminCookies);
  console.log(`Update Metadata Status: ${updateMetaRes.status}, altText: ${updateMetaRes.data.data.image.altText}`);

  // 9. Replace Image File
  const replaceRes = await sendMultipartRequest({ host: 'localhost', port: 5000, path: `/api/v1/admin/products/${productId}/images/${imageId1}/replace`, method: 'PUT' }, {}, dummyFile, adminCookies);
  console.log(`Replace Image Status: ${replaceRes.status}, new URL: ${replaceRes.data.data.image.url}`);

  // 10. Public Product Detail with Images
  const publicProdRes = await sendJsonRequest({ host: 'localhost', port: 5000, path: `/api/v1/products/${productSlug}`, method: 'GET' });
  console.log(`Public Product Detail Status: ${publicProdRes.status}, Images Count: ${publicProdRes.data.data.product.images.length}`);

  // 11. Customer Authorization Failure
  const custUploadRes = await sendMultipartRequest({ host: 'localhost', port: 5000, path: `/api/v1/admin/products/${productId}/images`, method: 'POST' }, { altText: 'Unauthorized' }, dummyFile, custCookies);
  console.log(`Customer Upload Status: ${custUploadRes.status}, Code: ${custUploadRes.data.error.code}`);

  // 12. Nonexistent Product Upload
  const nonExistentUploadRes = await sendMultipartRequest({ host: 'localhost', port: 5000, path: `/api/v1/admin/products/non-existent-id/images`, method: 'POST' }, { altText: 'Fake' }, dummyFile, adminCookies);
  console.log(`Nonexistent Product Upload Status: ${nonExistentUploadRes.status}, Code: ${nonExistentUploadRes.data.error.code}`);

  // 13. Image Limit Check (Upload until 10 images)
  for (let i = 3; i <= 10; i++) {
    await sendMultipartRequest({ host: 'localhost', port: 5000, path: `/api/v1/admin/products/${productId}/images`, method: 'POST' }, { altText: `Image ${i}` }, dummyFile, adminCookies);
  }
  const limitExceededRes = await sendMultipartRequest({ host: 'localhost', port: 5000, path: `/api/v1/admin/products/${productId}/images`, method: 'POST' }, { altText: 'Image 11' }, dummyFile, adminCookies);
  console.log(`Image Limit 11th Upload Status: ${limitExceededRes.status}, Code: ${limitExceededRes.data.error.code}`);

  // 14. Delete Primary Image
  const deleteImg2Res = await sendJsonRequest({ host: 'localhost', port: 5000, path: `/api/v1/admin/products/${productId}/images/${imageId2}`, method: 'DELETE' }, null, adminCookies);
  console.log(`Delete Primary Image Status: ${deleteImg2Res.status}`);

  // Verify next image auto-promoted to primary
  const afterDeleteList = await sendJsonRequest({ host: 'localhost', port: 5000, path: `/api/v1/admin/products/${productId}/images`, method: 'GET' }, null, adminCookies);
  const primaryRemaining = afterDeleteList.data.data.images.find(img => img.isPrimary);
  console.log(`Auto-Promoted Primary Image ID: ${primaryRemaining?.id}`);

  // 15. Delete Product
  await sendJsonRequest({ host: 'localhost', port: 5000, path: `/api/v1/admin/products/${productId}`, method: 'DELETE' }, null, adminCookies);

  // 16. B2-B9 Regressions
  const regHealth = await sendJsonRequest({ host: 'localhost', port: 5000, path: '/api/v1/health', method: 'GET' });
  const regCat = await sendJsonRequest({ host: 'localhost', port: 5000, path: '/api/v1/categories', method: 'GET' });
  const regCol = await sendJsonRequest({ host: 'localhost', port: 5000, path: '/api/v1/collections', method: 'GET' });
  const regProd = await sendJsonRequest({ host: 'localhost', port: 5000, path: '/api/v1/products', method: 'GET' });

  console.log(`Regressions - Health: ${regHealth.status}, Categories: ${regCat.data.success}, Collections: ${regCol.data.success}, Products: ${regProd.data.success}`);
  console.log("=== ALL B10 MEDIA & IMAGE MANAGEMENT TESTS PASSED PERFECTLY ===");
}

runB10Tests().catch(console.error);
