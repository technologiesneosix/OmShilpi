/**
 * Om Shilpi Jewels — Contact & Concierge Enquiry Controller
 */
document.addEventListener('DOMContentLoaded', () => {
  Contact.init();
});

const Contact = {
  init() {
    const form = document.querySelector('form');
    if (!form || !window.location.pathname.includes('/contact')) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nameInput = form.querySelector('input[name="name"], input[placeholder*="Name"]');
      const emailInput = form.querySelector('input[type="email"]');
      const phoneInput = form.querySelector('input[type="tel"]');
      const subjectInput = form.querySelector('input[name="subject"], input[placeholder*="Subject"], select');
      const messageInput = form.querySelector('textarea');

      if (!nameInput || !emailInput || !messageInput) {
        alert('Please fill in all required fields.');
        return;
      }

      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const phone = phoneInput ? phoneInput.value.trim() : undefined;
      const subject = subjectInput ? subjectInput.value.trim() : 'General Enquiry';
      const message = messageInput.value.trim();

      try {
        const res = await API.post('/enquiries', {
          name,
          email,
          phone,
          subject,
          message
        });

        if (res.success) {
          alert('Thank you for reaching out to Om Shilpi Jewels Concierge. Our team will contact you shortly.');
          form.reset();
        }
      } catch (err) {
        alert(err.message || 'Failed to send enquiry. Please try again.');
      }
    });
  }
};
