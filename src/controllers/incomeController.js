const incomeModel = require('../models/incomeModel');

async function create(req, res) {
  try {
    const { source, description, amount, occurredAt } = req.body;

    if (!source || !amount || !occurredAt) {
      return res.status(400).json({ error: 'Source, amount, dan occurredAt wajib diisi' });
    }

    const income = await incomeModel.createIncome({
      userId: req.user.userId, // diambil dari token, BUKAN dari body request
      source,
      description,
      amount,
      occurredAt,
    });

    res.status(201).json({ message: 'Pemasukan berhasil ditambahkan', income });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
}

async function getAll(req, res) {
  try {
    const incomes = await incomeModel.getIncomesByUser(req.user.userId);
    res.status(200).json({ incomes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
}

async function update(req, res) {
  try {
    const { id } = req.params;
    const { source, description, amount, occurredAt } = req.body;

    // Cek dulu data itu ada dan milik user yang login
    const existing = await incomeModel.getIncomeById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Data pemasukan tidak ditemukan' });
    }
    if (existing.user_id !== req.user.userId) {
      return res.status(403).json({ error: 'Kamu tidak berhak mengubah data ini' });
    }

    const updated = await incomeModel.updateIncome(id, { source, description, amount, occurredAt });
    res.status(200).json({ message: 'Pemasukan berhasil diperbarui', income: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
}

module.exports = { create, getAll, update };