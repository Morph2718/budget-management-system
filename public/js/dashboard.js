function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
  }
}

checkAuth();

window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    checkAuth();
  }
});

const token = localStorage.getItem('token');

async function loadSummary() {
  try {
    const data = await apiRequest('/summary', 'GET');
    document.getElementById('totalIncome').textContent = data.totalIncome;
    document.getElementById('totalExpense').textContent = data.totalExpense;
    document.getElementById('balance').textContent = data.balance;
  } catch (err) {
    console.error(err);
  }
}

async function loadIncomes() {
  try {
    const data = await apiRequest('/incomes', 'GET');
    const list = document.getElementById('incomeList');

    list.innerHTML = data.incomes
      .map(
        (income) => `
        <li>
          ${income.source} - Rp${income.amount} (${income.occurred_at.split('T')[0]})
        </li>
      `
      )
      .join('');
  } catch (err) {
    console.error(err);
  }
}

document.getElementById('incomeForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const source = document.getElementById('source').value;
  const description = document.getElementById('incomeDescription').value;
  const amount = document.getElementById('incomeAmount').value;
  const occurredAt = document.getElementById('incomeDate').value;

  try {
    await apiRequest('/incomes', 'POST', { source, description, amount, occurredAt });
    event.target.reset(); // kosongkan form setelah berhasil
    loadIncomes();  // muat ulang daftar
    loadSummary();  // muat ulang total, karena sudah berubah
  } catch (err) {
    console.error(err);
  }
});

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

async function loadExpenses() {
  try {
    const data = await apiRequest('/expenses', 'GET');
    const list = document.getElementById('expenseList');

    list.innerHTML = data.expenses
      .map(
        (expense) => `
        <li>
          ${expense.item} - Rp${expense.amount} (${expense.occurred_at.split('T')[0]})
        </li>
      `
      )
      .join('');
  } catch (err) {
    console.error(err);
  }
}

document.getElementById('expenseForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const item = document.getElementById('item').value;
  const description = document.getElementById('expenseDescription').value;
  const amount = document.getElementById('expenseAmount').value;
  const occurredAt = document.getElementById('expenseDate').value;

  try {
    await apiRequest('/expenses', 'POST', { item, description, amount, occurredAt });
    event.target.reset(); // kosongkan form setelah berhasil
    loadExpenses();  // muat ulang daftar
    loadSummary();  // muat ulang total, karena sudah berubah
  } catch (err) {
    console.error(err);
  }
});

loadIncomes();
loadExpenses();
loadSummary();