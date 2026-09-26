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

module.exports = { getAllUsers };