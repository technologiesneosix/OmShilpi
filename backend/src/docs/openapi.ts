export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Om Shilpi Jewellers API Documentation',
    version: '1.0.0',
    description:
      'Production-grade e-commerce backend API for Om Shilpi Jewellers. Built with Node.js, Express, TypeScript, Prisma, Aiven MySQL, Cloudinary, and Razorpay.',
    contact: {
      name: 'Om Shilpi Tech Team',
      email: 'tech@omshilpijewellers.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000/api/v1',
      description: 'Local API v1 Server',
    },
    {
      url: 'http://localhost:5000/api',
      description: 'Standalone Direct Checkout Routes',
    },
  ],
  tags: [
    { name: 'Health', description: 'Server health check' },
    { name: 'Authentication', description: 'User registration, login, JWT management & password resets' },
    { name: 'Users & Addresses', description: 'Customer profiles and shipping address management' },
    { name: 'Categories', description: 'Jewellery product categories' },
    { name: 'Collections', description: 'Jewellery collections' },
    { name: 'Products', description: 'Jewellery products catalog & administration' },
    { name: 'Media', description: 'Product image management via Cloudinary' },
    { name: 'Inventory', description: 'Stock tracking, threshold configuration & stock transactions' },
    { name: 'Cart', description: 'Shopping cart operations' },
    { name: 'Wishlist', description: 'Customer saved wishlist items' },
    { name: 'Checkout', description: 'Cart checkout & internal order creation' },
    { name: 'Orders', description: 'Customer order history & tracking' },
    { name: 'Payments', description: 'Razorpay order creation, payment verification & webhooks' },
    { name: 'Order Management', description: 'Admin order processing & status updates' },
    { name: 'Enquiries', description: 'Customer contact form submissions & admin status handling' },
    { name: 'Banners', description: 'Homepage promotional banners' },
    { name: 'Testimonials', description: 'Customer reviews & testimonials' },
    { name: 'Homepage Content', description: 'Dynamic homepage content configuration' },
    { name: 'Admin Dashboard', description: 'Aggregated admin business metrics & recent orders' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT bearer token in format: Bearer <token>',
      },
    },
    schemas: {
      ApiSuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Operation completed successfully' },
          data: { type: 'object' },
        },
      },
      ApiErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Error message description' },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'BAD_REQUEST' },
              details: { type: 'object' },
            },
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'cju123456789' },
          name: { type: 'string', example: 'Ananya Sharma' },
          email: { type: 'string', example: 'ananya@example.com' },
          phone: { type: 'string', example: '9876543210' },
          role: { type: 'string', enum: ['CUSTOMER', 'STAFF', 'ADMIN', 'SUPER_ADMIN'], example: 'CUSTOMER' },
          status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'BLOCKED'], example: 'ACTIVE' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Address: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'addr123' },
          userId: { type: 'string', example: 'cju123456789' },
          fullName: { type: 'string', example: 'Ananya Sharma' },
          phone: { type: 'string', example: '9876543210' },
          streetAddress: { type: 'string', example: '123 Jewellery Park' },
          city: { type: 'string', example: 'Jaipur' },
          state: { type: 'string', example: 'Rajasthan' },
          pincode: { type: 'string', example: '302001' },
          country: { type: 'string', example: 'India' },
          isDefault: { type: 'boolean', example: true },
        },
      },
      Category: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'cat123' },
          name: { type: 'string', example: 'Rings' },
          slug: { type: 'string', example: 'rings' },
          description: { type: 'string', example: 'Handcrafted gold and diamond rings' },
          imageUrl: { type: 'string', example: 'https://res.cloudinary.com/demo/ring.jpg' },
          isActive: { type: 'boolean', example: true },
        },
      },
      Collection: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'col123' },
          name: { type: 'string', example: 'Bridal Heritage' },
          slug: { type: 'string', example: 'bridal-heritage' },
          description: { type: 'string', example: 'Royal bridal jewellery collection' },
          bannerImageUrl: { type: 'string', example: 'https://res.cloudinary.com/demo/banner.jpg' },
          isActive: { type: 'boolean', example: true },
        },
      },
      Product: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'prod123' },
          name: { type: 'string', example: 'Royal Kundan Solitaire Ring' },
          slug: { type: 'string', example: 'royal-kundan-solitaire-ring' },
          sku: { type: 'string', example: 'OSJ-RN-001' },
          price: { type: 'number', example: 45000 },
          compareAtPrice: { type: 'number', example: 50000 },
          description: { type: 'string', example: '22k Gold Solitaire Ring with Kundan Craftsmanship' },
          isFeatured: { type: 'boolean', example: true },
          isNewArrival: { type: 'boolean', example: true },
          isActive: { type: 'boolean', example: true },
          images: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                url: { type: 'string' },
                isPrimary: { type: 'boolean' },
              },
            },
          },
        },
      },
      Inventory: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'inv123' },
          productId: { type: 'string', example: 'prod123' },
          quantity: { type: 'integer', example: 15 },
          lowStockThreshold: { type: 'integer', example: 5 },
          availabilityStatus: { type: 'string', enum: ['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'], example: 'IN_STOCK' },
        },
      },
      CartItem: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'item123' },
          productId: { type: 'string', example: 'prod123' },
          quantity: { type: 'integer', example: 2 },
          price: { type: 'number', example: 45000 },
          product: { $ref: '#/components/schemas/Product' },
        },
      },
      Order: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'ord123' },
          orderNumber: { type: 'string', example: 'OSJ-20260816-0001' },
          status: {
            type: 'string',
            enum: ['PENDING', 'CONFIRMED', 'PROCESSING', 'READY_FOR_DISPATCH', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'],
            example: 'CONFIRMED',
          },
          paymentStatus: { type: 'string', enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'], example: 'PAID' },
          total: { type: 'number', example: 90000 },
          subtotal: { type: 'number', example: 90000 },
          taxTotal: { type: 'number', example: 0 },
          shippingTotal: { type: 'number', example: 0 },
          shippingFullName: { type: 'string', example: 'Ananya Sharma' },
          shippingAddress: { type: 'string', example: '123 Jewellery Park, Jaipur, Rajasthan 302001' },
          shippingPhone: { type: 'string', example: '9876543210' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Enquiry: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'enq123' },
          name: { type: 'string', example: 'Rahul Verma' },
          email: { type: 'string', example: 'rahul@example.com' },
          phone: { type: 'string', example: '9876543210' },
          subject: { type: 'string', example: 'Custom Jewellery Inquiry' },
          message: { type: 'string', example: 'Interested in custom bridal set options.' },
          status: { type: 'string', enum: ['NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'], example: 'NEW' },
        },
      },
      Banner: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'ban123' },
          title: { type: 'string', example: 'Festive Gold Collection' },
          subtitle: { type: 'string', example: 'Up to 20% off on making charges' },
          imageUrl: { type: 'string', example: 'https://res.cloudinary.com/demo/banner.jpg' },
          ctaText: { type: 'string', example: 'Shop Now' },
          ctaLink: { type: 'string', example: '/collections/festive' },
          sortOrder: { type: 'integer', example: 1 },
          isActive: { type: 'boolean', example: true },
        },
      },
      Testimonial: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'tst123' },
          name: { type: 'string', example: 'Pooja Mehta' },
          designation: { type: 'string', example: 'Verified Buyer' },
          content: { type: 'string', example: 'Exquisite Kundan craftsmanship and brilliant service!' },
          rating: { type: 'integer', example: 5 },
          isActive: { type: 'boolean', example: true },
        },
      },
      DashboardSummary: {
        type: 'object',
        properties: {
          totalCustomers: { type: 'integer', example: 120 },
          totalProducts: { type: 'integer', example: 450 },
          totalOrders: { type: 'integer', example: 380 },
          totalRevenue: { type: 'number', example: 17500000 },
          pendingOrders: { type: 'integer', example: 12 },
          lowStock: { type: 'integer', example: 4 },
          newEnquiries: { type: 'integer', example: 8 },
          recentOrders: {
            type: 'array',
            items: { $ref: '#/components/schemas/Order' },
          },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Server Health Check',
        responses: {
          '200': { description: 'Server operational', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccessResponse' } } } },
        },
      },
    },
    '/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register Customer Account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Ananya Sharma' },
                  email: { type: 'string', example: 'ananya@example.com' },
                  password: { type: 'string', example: 'Test@12345' },
                  phone: { type: 'string', example: '9876543210' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Account created successfully' },
          '400': { description: 'Validation error' },
          '409': { description: 'Email already registered' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Customer / Admin Login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'admin@omshilpi.com' },
                  password: { type: 'string', example: 'AdminSecret@123' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Login successful, returns JWT token' },
          '401': { description: 'Invalid email or password' },
          '429': { description: 'Too many authentication attempts' },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get Current Authenticated User Profile',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Current profile retrieved' },
          '401': { description: 'Unauthorized / Token missing or invalid' },
        },
      },
    },
    '/categories': {
      get: {
        tags: ['Categories'],
        summary: 'Get Public Active Categories',
        responses: {
          '200': { description: 'List of active categories' },
        },
      },
    },
    '/products': {
      get: {
        tags: ['Products'],
        summary: 'Search & List Products Catalog',
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search term for product name or SKU' },
          { name: 'category', in: 'query', schema: { type: 'string' }, description: 'Filter by category slug or ID' },
          { name: 'collection', in: 'query', schema: { type: 'string' }, description: 'Filter by collection slug or ID' },
          { name: 'featured', in: 'query', schema: { type: 'boolean' }, description: 'Filter featured products' },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: {
          '200': { description: 'Paginated product list' },
        },
      },
    },
    '/products/{slug}': {
      get: {
        tags: ['Products'],
        summary: 'Get Single Product Details by Slug',
        parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' }, example: 'royal-kundan-solitaire-ring' }],
        responses: {
          '200': { description: 'Product details' },
          '404': { description: 'Product not found' },
        },
      },
    },
    '/cart': {
      get: {
        tags: ['Cart'],
        summary: 'Get Authenticated Customer Cart',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Customer cart and line items' },
          '401': { description: 'Unauthorized' },
        },
      },
      delete: {
        tags: ['Cart'],
        summary: 'Clear Authenticated Customer Cart',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Cart cleared' },
        },
      },
    },
    '/cart/items': {
      post: {
        tags: ['Cart'],
        summary: 'Add Item to Cart (Price calculated by Backend)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['productId', 'quantity'],
                properties: {
                  productId: { type: 'string', example: 'prod123' },
                  quantity: { type: 'integer', example: 1 },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Item added to cart' },
          '400': { description: 'Invalid quantity or stock issue' },
        },
      },
    },
    '/checkout': {
      post: {
        tags: ['Checkout'],
        summary: 'Process Checkout and Create Internal Order',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['addressId'],
                properties: {
                  addressId: { type: 'string', example: 'addr123' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Order created successfully' },
          '400': { description: 'Empty cart or invalid address' },
        },
      },
    },
    '/orders': {
      get: {
        tags: ['Orders'],
        summary: 'Get Customer Own Orders List',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Paginated customer orders' },
        },
      },
    },
    '/payments/create-order': {
      post: {
        tags: ['Payments'],
        summary: 'Create or Retrieve Razorpay Order for Internal Order',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['orderId'],
                properties: {
                  orderId: { type: 'string', example: 'ord123' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Razorpay order created with order_id, amount & key_id' },
        },
      },
    },
    '/payments/verify': {
      post: {
        tags: ['Payments'],
        summary: 'Verify Razorpay HMAC-SHA256 Payment Signature',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['razorpay_payment_id', 'razorpay_order_id', 'razorpay_signature'],
                properties: {
                  orderId: { type: 'string', example: 'ord123' },
                  razorpay_payment_id: { type: 'string', example: 'pay_P123456789' },
                  razorpay_order_id: { type: 'string', example: 'order_O123456789' },
                  razorpay_signature: { type: 'string', example: '4a6b2c7d8e9f...' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Payment verified and order status updated to CONFIRMED' },
          '400': { description: 'Invalid signature or payment mismatch' },
        },
      },
    },
    '/enquiries': {
      post: {
        tags: ['Enquiries'],
        summary: 'Submit Public Contact / Enquiry Form',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'phone', 'subject', 'message'],
                properties: {
                  name: { type: 'string', example: 'Rahul Verma' },
                  email: { type: 'string', example: 'rahul@example.com' },
                  phone: { type: 'string', example: '9876543210' },
                  subject: { type: 'string', example: 'Bridal Set Price Inquiry' },
                  message: { type: 'string', example: 'I would like details on customization options.' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Enquiry submitted successfully' },
        },
      },
    },
    '/banners': {
      get: {
        tags: ['Banners'],
        summary: 'Get Active Homepage Banners',
        responses: {
          '200': { description: 'Active banners list sorted by sortOrder' },
        },
      },
    },
    '/testimonials': {
      get: {
        tags: ['Testimonials'],
        summary: 'Get Active Testimonials',
        responses: {
          '200': { description: 'Active testimonials list sorted by sortOrder' },
        },
      },
    },
    '/content/home': {
      get: {
        tags: ['Homepage Content'],
        summary: 'Get Public Homepage Configuration Content',
        responses: {
          '200': { description: 'Homepage content sections JSON' },
        },
      },
    },
    '/admin/dashboard': {
      get: {
        tags: ['Admin Dashboard'],
        summary: 'Get Aggregated Business Summary & Recent Orders',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Aggregated admin metrics',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/DashboardSummary' } } },
          },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden (Customer account denied)' },
        },
      },
    },
  },
};
