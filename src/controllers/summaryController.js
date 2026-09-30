const incomeModel = require('../models/incomeModel');
const expenseModel = require('../models/expenseModel');

async function getSummary(req, res) {
  try {
    const userId = req.user.userId;

    const totalIncome = await incomeModel.getTotalIncomeByUser(userId);
    const totalExpense = await expenseModel.getTotalExpenseByUser(userId);
    const balance = totalIncome - totalExpense;

    res.status(200).json({
      totalIncome,
      totalExpense,
      balance,
    });
  } catch (err) {
    Sentry.captureException(err);
    req.log.error({ err }, 'Gagal mengambil ringkasan');
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
}

module.exports = { getSummary };