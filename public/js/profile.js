const token = localStorage.getItem('token');
if (!token) {
  window.location.href = 'login.html';
}

async function loadProfile() {
  try {
    const data = await apiRequest('/auth/profile', 'GET');
    document.getElementById('firstName').value = data.user.first_name;
    document.getElementById('lastName').value = data.user.last_name;
    document.getElementById('email').value = data.user.email;
  } catch (err) {
    console.error(err);
  }
}

document.getElementById('profileForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const firstName = document.getElementById('firstName').value;
  const lastName = document.getElementById('lastName').value;
  const email = document.getElementById('email').value;
  const newPassword = document.getElementById('newPassword').value;
  const msg = document.getElementById('msg');

  try {
    await apiRequest('/auth/profile', 'PUT', {
      firstName,
      lastName,
      email,
      newPassword: newPassword || null,
    });
    msg.textContent = 'Profil berhasil diperbarui';
  } catch (err) {
    msg.textContent = err.message;
  }
});

loadProfile();