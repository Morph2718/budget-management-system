const token = localStorage.getItem('token');
if (!token) {
  window.location.href = 'login.html';
}

async function loadAdminSummary() {
  try {
    const data = await apiRequest('/admin/dashboard', 'GET');
    document.getElementById('adminTotalIncome').textContent = data.totalIncome;
    document.getElementById('adminTotalExpense').textContent = data.totalExpense;
    document.getElementById('adminBalance').textContent = data.balance;
    document.getElementById('adminTotalUsers').textContent = data.totalUsers;
  } catch (err) {
    console.error(err);
  }
}

async function loadUsers() {
  try {
    const data = await apiRequest('/admin/users', 'GET');
    document.getElementById('userList').innerHTML = data.users
      .map((u) => `<li>${u.username} - ${u.role}</li>`) // tampilkan role-nya juga
      .join('');
  } catch (err) {
    console.error(err);
  }
}

async function loadTransactions() {
  try {
    const data = await apiRequest('/admin/transactions', 'GET');
    document.getElementById('transactionList').innerHTML = [
      ...data.incomes.map((i) => `<li>[Income] ${i.username}: ${i.source} - Rp${i.amount}</li>`),
      ...data.expenses.map((e) => `<li>[Expense] ${e.username}: ${e.item} - Rp${e.amount}</li>`),
    ].join('');
  } catch (err) {
    console.error(err);
  }
}

async function loadLogs() {
  try {
    const data = await apiRequest('/admin/logs', 'GET');
    document.getElementById('logList').innerHTML = data.logs
      .map((log) => `<li>${log.username || 'unknown'} - ${log.action} - ${log.created_at}</li>`)
      .join('');
  } catch (err) {
    console.error(err);
  }
}

document.getElementById('logoutBtn').addEventListener('click', async () => {
  try {
    await apiRequest('/auth/logout', 'POST');
  } catch (err) {
    console.error(err);
  }
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  window.location.href = 'login.html';
});

document.getElementById('deleteUserBtn').addEventListener('click', async () => {
  const id = document.getElementById('deleteUserId').value;
  const deleteMsg = document.getElementById('deleteMsg');

  try {
    const data = await apiRequest(`/admin/users/${id}`, 'DELETE');
    deleteMsg.textContent = data.message;
    loadUsers(); // muat ulang daftar user
  } catch (err) {
    deleteMsg.textContent = err.message;
  }
});

loadAdminSummary();
loadUsers();
loadTransactions();
loadLogs();