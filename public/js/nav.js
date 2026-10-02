const role = localStorage.getItem('role');

document.querySelectorAll('.nav-customer, .nav-admin, .nav-owner').forEach((el) => {
  el.style.display = 'none';
});

if (role === 'customer') {
  document.querySelector('.nav-customer').style.display = 'inline';
} else if (role === 'admin') {
  document.querySelector('.nav-customer').style.display = 'inline';
  document.querySelector('.nav-admin').style.display = 'inline';
} else if (role === 'owner') {
  document.querySelector('.nav-customer').style.display = 'inline';
  document.querySelector('.nav-admin').style.display = 'inline';
  document.querySelector('.nav-owner').style.display = 'inline';
}