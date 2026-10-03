let editingIncomeId = null;
let editingExpenseId = null;

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
          <button class="editIncomeBtn" data-id="${income.id}" data-source="${income.source}" data-description="${income.description || ''}" data-amount="${income.amount}" data-date="${income.occurred_at.split('T')[0]}">Edit</button>
        </li>
      `
      )
      .join('');

    // Pasang event listener untuk semua tombol edit yang baru dibuat
    document.querySelectorAll('.editIncomeBtn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.getElementById('source').value = btn.dataset.source;
        document.getElementById('incomeDescription').value = btn.dataset.description;
        document.getElementById('incomeAmount').value = btn.dataset.amount;
        document.getElementById('incomeDate').value = btn.dataset.date;
        editingIncomeId = btn.dataset.id; // simpan id yang sedang diedit
      });
    });
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
    if (editingIncomeId) {
      // Mode edit: panggil PUT
      await apiRequest(`/incomes/${editingIncomeId}`, 'PUT', { source, description, amount, occurredAt });
      editingIncomeId = null; // reset mode kembali ke tambah
    } else {
      // Mode tambah: panggil POST seperti biasa
      await apiRequest('/incomes', 'POST', { source, description, amount, occurredAt });
    }

    event.target.reset();
    loadIncomes();
    loadSummary();
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
          <button class="editExpenseBtn" data-id="${expense.id}" data-item="${expense.item}" data-description="${expense.description || ''}" data-amount="${expense.amount}" data-date="${expense.occurred_at.split('T')[0]}">Edit</button>
        </li>
      `
      )
      .join('');

    // Pasang event listener untuk semua tombol edit yang baru dibuat
    document.querySelectorAll('.editExpenseBtn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.getElementById('item').value = btn.dataset.item;
        document.getElementById('expenseDescription').value = btn.dataset.description;
        document.getElementById('expenseAmount').value = btn.dataset.amount;
        document.getElementById('expenseDate').value = btn.dataset.date;
        editingExpenseId = btn.dataset.id; // simpan id yang sedang diedit
      });
    });
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
    if (editingExpenseId) {
      // Mode edit: panggil PUT
      await apiRequest(`/expenses/${editingExpenseId}`, 'PUT', { item, description, amount, occurredAt });
      editingExpenseId = null; // reset mode kembali ke tambah
    } else {
      // Mode tambah: panggil POST seperti biasa
      await apiRequest('/expenses', 'POST', { item, description, amount, occurredAt });
    }

    event.target.reset();
    loadExpenses();
    loadSummary();
  } catch (err) {
    console.error(err);
  }
});

loadIncomes();
loadExpenses();
loadSummary();