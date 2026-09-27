const userModel = require('../models/userModel');
const incomeModel = require('../models/incomeModel');
const expenseModel = require('../models/expenseModel');

async function getAllUsers(req, res) {
  try {
    const users = await userModel.getAllUsers();
    res.status(200).json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
}

async function getAllTransactions(req, res) {
  try {
    const incomes = await incomeModel.getAllIncomes();
    const expenses = await expenseModel.getAllExpenses();
    res.status(200).json({ incomes, expenses });
  } catch (err) {
    console.error(err);
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
    console.error(err);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
}

module.exports = { getAllUsers, getAllTransactions, getDashboard };
