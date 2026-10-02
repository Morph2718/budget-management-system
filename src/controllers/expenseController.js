const expenseModel = require('../models/expenseModel');
const activityLogModel = require('../models/activityLogModel');
const Sentry = require('@sentry/node');

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

    await activityLogModel.logActivity({
      userId: req.user.userId,
      action: 'create_expense', 
      entity: 'expense',
      entityId: expense.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json({ message: 'Pengeluaran berhasil ditambahkan', expense });
  } catch (err) {
    Sentry.captureException(err);
    req.log.error({ err }, 'Gagal menambahkan pengeluaran');
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
}

async function getAll(req, res) {
  try {
    const expenses = await expenseModel.getExpensesByUser(req.user.userId);
    res.status(200).json({ expenses });
  } catch (err) {
    Sentry.captureException(err);
    req.log.error({ err }, 'Gagal mengambil pengeluaran');
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
    await activityLogModel.logActivity({
      userId: req.user.userId,
      action: 'update_expense', 
      entity: 'expense',
      entityId: updated.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    res.status(200).json({ message: 'Pengeluaran berhasil diperbarui', expense: updated });
  } catch (err) {
    Sentry.captureException(err);
    req.log.error({ err }, 'Gagal memperbarui pengeluaran');
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
}

module.exports = { create, getAll, update };