document.getElementById('loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const errorMsg = document.getElementById('errorMsg');

  try {
    const data = await apiRequest('/auth/login', 'POST', { username, password });

    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.user.role);

    // Arahkan ke dashboard sesuai role
    if (data.user.role === 'customer') {
      window.location.href = 'dashboard-customer.html';
    } else if (data.user.role === 'admin') {
      window.location.href = 'dashboard-admin.html';
    } else if (data.user.role === 'owner') {
      window.location.href = 'dashboard-owner.html';
    }
  } catch (err) {
    errorMsg.textContent = err.message;
  }
});

const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('errorMsg');

    try {
      await apiRequest('/auth/register', 'POST', {
        firstName, lastName, email, username, password,
      });
      window.location.href = 'login.html'; 
    } catch (err) {
      errorMsg.textContent = err.message;
    }
  });
}