const userModel = require('../models/userModel');
const incomeModel = require('../models/incomeModel');
const expenseModel = require('../models/expenseModel');
const activityLogModel = require('../models/activityLogModel');
const Sentry = require('@sentry/node');

//admin skill
async function getAllUsers(req, res) {
  try {
    const users = await userModel.getAllUsers();
    res.status(200).json({ users });
  } catch (err) {
    Sentry.captureException(err);
    req.log.error({ err }, 'Gagal mengambil daftar user');
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
}

async function getAllTransactions(req, res) {
  try {
    const incomes = await incomeModel.getAllIncomes();
    const expenses = await expenseModel.getAllExpenses();
    res.status(200).json({ incomes, expenses });
  } catch (err) {
    Sentry.captureException(err);
    req.log.error({ err }, 'Gagal mengambil transaksi');
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
}

async function getDashboard(req, res) {
  try {
    const totalIncome = await incomeModel.getTotalIncomeAll();
    const totalExpense = await expenseModel.getTotalExpenseAll();
    const totalUsers = (await userModel.getAllUsers()).length;

    res.status(200).json({
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      totalUsers,
    });
  } catch (err) {
    Sentry.captureException(err);
    req.log.error({ err }, 'Gagal mengambil data dashboard');
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
}

// owner skill
async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const targetUser = await userModel.findById(id);

    if (!targetUser) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }

    // Owner tidak boleh dihapus siapa pun, termasuk dirinya sendiri lewat endpoint ini
    if (targetUser.role === 'owner') {
      return res.status(403).json({ error: 'Akun owner tidak dapat dihapus' });
    }

    await userModel.deleteUser(id);
    await activityLogModel.logActivity({
      userId: req.user.userId,
      action: 'delete_user',
      entity: 'user',
      entityId: targetUser.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    res.status(200).json({ message: `User ${targetUser.username} berhasil dihapus` });
  } catch (err) {
    Sentry.captureException(err);
    req.log.error({ err }, 'Gagal menghapus user');
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
}

async function getLogs(req, res) {
  try {
    const logs = await activityLogModel.getAllLogs();
    res.status(200).json({ logs });
  } catch (err) {
    Sentry.captureException(err);
    req.log.error({ err }, 'Gagal mengambil log aktivitas');
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
}

module.exports = { getAllUsers, getAllTransactions, getDashboard, deleteUser, getLogs };
