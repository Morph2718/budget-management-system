const incomeModel = require('../models/incomeModel');
const activityLogModel = require('../models/activityLogModel');
const Sentry = require('@sentry/node');

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

    await activityLogModel.logActivity({
      userId: req.user.userId,
      action: 'create_income',
      entity: 'income',
      entityId: income.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json({ message: 'Pemasukan berhasil ditambahkan', income });
  } catch (err) {
    Sentry.captureException(err);
    req.log.error({ err }, 'Gagal menambahkan pemasukan');
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
}

async function getAll(req, res) {
  try {
    const incomes = await incomeModel.getIncomesByUser(req.user.userId);
    res.status(200).json({ incomes });
  } catch (err) {
    Sentry.captureException(err);
    req.log.error({ err }, 'Gagal mengambil pemasukan');
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
    await activityLogModel.logActivity({
      userId: req.user.userId,
      action: 'update_income',
      entity: 'income',
      entityId: updated.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    res.status(200).json({ message: 'Pemasukan berhasil diperbarui', income: updated });
  } catch (err) {
    Sentry.captureException(err);
    req.log.error({ err }, 'Gagal memperbarui pemasukan');
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
}

module.exports = { create, getAll, update };