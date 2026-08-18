/**
 * Om Shilpi Jewels — Auth Page Controller (Login & Register)
 */
document.addEventListener('DOMContentLoaded', () => {
  Auth.init();
});

const Auth = {
  init() {
    this.setupLoginForm();
    this.setupRegisterForm();
  },

  setupLoginForm() {
    const form = document.querySelector('form');
    if (!form || !window.location.pathname.includes('/login')) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailInput = form.querySelector('input[type="email"]');
      const passwordInput = form.querySelector('input[type="password"]');

      if (!emailInput || !passwordInput) return;

      const email = emailInput.value.trim();
      const password = passwordInput.value;

      try {
        const res = await API.post('/auth/login', { email, password });
        if (res.success && res.data && res.data.accessToken) {
          API.setToken(res.data.accessToken);
          alert('Welcome back to Om Shilpi Jewels!');
          window.location.href = '/account';
        }
      } catch (err) {
        alert(err.message || 'Login failed. Please check your credentials.');
      }
    });
  },

  setupRegisterForm() {
    const form = document.querySelector('form');
    if (!form || !window.location.pathname.includes('/register')) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nameInput = form.querySelector('input[type="text"], input[name="name"]');
      const emailInput = form.querySelector('input[type="email"]');
      const passwordInput = form.querySelector('input[type="password"]');
      const phoneInput = form.querySelector('input[type="tel"]');

      if (!emailInput || !passwordInput) return;

      const name = nameInput ? nameInput.value.trim() : 'Customer';
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      const phone = phoneInput ? phoneInput.value.trim() : undefined;

      try {
        const res = await API.post('/auth/register', { name, email, password, phone });
        if (res.success) {
          alert('Account created successfully! Please sign in.');
          window.location.href = '/login';
        }
      } catch (err) {
        alert(err.message || 'Registration failed.');
      }
    });
  }
};
