/**
 * Om Shilpi Jewels — Checkout & Payment Integration Controller (Hardened Vanilla JS)
 */
document.addEventListener('DOMContentLoaded', () => {
  Checkout.init();
});

const Checkout = {
  cart: null,
  addresses: [],
  selectedAddressId: null,

  async init() {
    if (!API.getToken()) {
      alert('Please sign in to proceed with checkout.');
      window.location.href = '/login';
      return;
    }
    await this.loadCart();
    await this.loadAddresses();
    this.setupPayButton();
  },

  async loadCart() {
    try {
      const res = await API.get('/cart');
      if (res.success && res.data && res.data.items && res.data.items.length > 0) {
        this.cart = res.data;
        this.renderOrderSummary();
      } else {
        alert('Your bag is empty. Please add items before checking out.');
        window.location.href = '/shop';
      }
    } catch (e) {
      alert('Failed to load shopping bag.');
      window.location.href = '/cart';
    }
  },

  async loadAddresses() {
    try {
      const res = await API.get('/addresses');
      if (res.success && res.data && res.data.length > 0) {
        this.addresses = res.data;
        const isDefault = this.addresses.find(a => a.isDefault) || this.addresses[0];
        this.selectedAddressId = isDefault.id;
      }
    } catch (e) {
      console.warn('No saved addresses found');
    }
  },

  renderOrderSummary() {
    if (!this.cart) return;

    const subtotal = this.cart.items.reduce((acc, item) => acc + (Number(item.product?.price || 0) * item.quantity), 0);
    const shipping = 0.00; // Free Insured Express Shipping
    const tax = Math.round(subtotal * 0.03); // 3% GST snapshot
    const total = subtotal + shipping + tax;

    const priceElements = Array.from(document.querySelectorAll('.font-price-display, .text-2xl.font-bold, span'));
    const summaryTotalEl = priceElements.find(el => el.children.length === 0 && (el.innerText.includes('₹') || el.innerText.includes('Total')));
    if (summaryTotalEl) {
      summaryTotalEl.innerText = API.formatPrice(total);
    }
  },

  setupPayButton() {
    const payBtn = Array.from(document.querySelectorAll('button')).find(btn =>
      btn.innerText.toLowerCase().includes('pay') ||
      btn.innerText.toLowerCase().includes('place order') ||
      btn.innerText.toLowerCase().includes('confirm') ||
      btn.id === 'payBtn'
    );

    if (payBtn) {
      payBtn.onclick = async (e) => {
        e.preventDefault();
        await this.processCheckout(payBtn);
      };
    }
  },

  async processCheckout(payBtn) {
    payBtn.disabled = true;
    const origText = payBtn.innerText;
    payBtn.innerText = 'Securing Order...';

    try {
      // Step 1: Ensure Shipping Address is selected or created
      let addressId = this.selectedAddressId;

      if (!addressId) {
        // Collect form fields if available
        const nameInput = document.querySelector('input[name="name"], input[placeholder*="Name"]');
        const phoneInput = document.querySelector('input[name="phone"], input[placeholder*="Phone"]');
        const line1Input = document.querySelector('input[name="addressLine1"], input[placeholder*="Address"]');
        const cityInput = document.querySelector('input[name="city"], input[placeholder*="City"]');
        const stateInput = document.querySelector('input[name="state"], input[placeholder*="State"]');
        const pinInput = document.querySelector('input[name="postalCode"], input[placeholder*="PIN"]');

        const name = nameInput ? nameInput.value.trim() : 'Customer';
        const phone = phoneInput ? phoneInput.value.trim() : '9876543210';
        const line1 = line1Input ? line1Input.value.trim() : 'Signature Villa, Road 12';
        const city = cityInput ? cityInput.value.trim() : 'Mumbai';
        const state = stateInput ? stateInput.value.trim() : 'Maharashtra';
        const postalCode = pinInput ? pinInput.value.trim() : '400001';

        const addrRes = await API.post('/addresses', {
          fullName: name,
          phone: phone,
          addressLine1: line1,
          city: city,
          state: state,
          postalCode: postalCode,
          country: 'India',
          isDefault: true
        });

        if (addrRes.success && addrRes.data) {
          addressId = addrRes.data.id;
        }
      }

      // Step 2: Create internal Order via Checkout API
      const checkoutRes = await API.post('/checkout', { shippingAddressId: addressId });
      if (!checkoutRes.success || !checkoutRes.data) {
        throw new Error(checkoutRes.message || 'Failed to create internal order');
      }

      const internalOrder = checkoutRes.data.order || checkoutRes.data;
      const internalOrderId = internalOrder.id;

      // Step 3: Create Razorpay Order via Authenticated Payment API
      const rzpOrderRes = await API.post('/payments/create-order', { orderId: internalOrderId });
      if (!rzpOrderRes.success || !rzpOrderRes.data) {
        throw new Error(rzpOrderRes.message || 'Failed to initialize Razorpay Order');
      }

      const { razorpayOrderId, keyId, amount, currency } = rzpOrderRes.data;

      // Step 4: Launch Razorpay Web Checkout Modal
      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: 'Om Shilpi Jewellers',
        description: `Order #${internalOrder.orderNumber || internalOrderId}`,
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            // Step 5: Verify Signature via Authenticated Payment API
            const verifyRes = await API.post('/payments/verify', {
              orderId: internalOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyRes.success) {
              window.location.href = `/order-confirmed?orderId=${internalOrderId}`;
            } else {
              window.location.href = `/payment-unsuccessful?reason=${encodeURIComponent(verifyRes.message || 'Signature mismatch')}`;
            }
          } catch (verifyErr) {
            window.location.href = `/payment-unsuccessful?reason=${encodeURIComponent(verifyErr.message)}`;
          }
        },
        modal: {
          ondismiss: function () {
            payBtn.disabled = false;
            payBtn.innerText = origText;
            alert('Payment cancelled before completion.');
          }
        }
      };

      const rzp = new Razorpay(options);
      rzp.open();

    } catch (err) {
      payBtn.disabled = false;
      payBtn.innerText = origText;
      alert(err.message || 'Checkout failed.');
    }
  }
};
