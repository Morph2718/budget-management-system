const expenseModel = require('../models/expenseModel');

async function create(req, res) {
  try {
    const { item, description, amount, occurredAt } = req.body;

    if (!item || !amount || !occurredAt) {
      return res.status(400).json({ error: 'Item, amount, dan occurredAt wajib diisi' });
    }

    const expense = await expenseModel.createExpense({
      userId: req.user.userId, // diambil dari token, BUKAN dari body request
      item,
      description,
      amount,
      occurredAt,
    });

    res.status(201).json({ message: 'Pengeluaran berhasil ditambahkan', expense });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
}

async function getAll(req, res) {
  try {
    const expenses = await expenseModel.getExpensesByUser(req.user.userId);
    res.status(200).json({ expenses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
}

async function update(req, res) {
  try {
    const { id } = req.params;
    const { item, description, amount, occurredAt } = req.body;

    // Cek dulu data itu ada dan milik user yang login
    const existing = await expenseModel.getExpenseById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Data pengeluaran tidak ditemukan' });
    }
    if (existing.user_id !== req.user.userId) {
      return res.status(403).json({ error: 'Kamu tidak berhak mengubah data ini' });
    }

    const updated = await expenseModel.updateExpense(id, { item, description, amount, occurredAt });
    res.status(200).json({ message: 'Pengeluaran berhasil diperbarui', expense: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
}

module.exports = { create, getAll, update };