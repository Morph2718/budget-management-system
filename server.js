// Import
const express = require('express');
require('dotenv').config();

const pool = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const incomeRoutes = require('./src/routes/incomeRoutes');
const expenseRoutes = require('./src/routes/expenseRoutes');
const summaryRoutes = require('./src/routes/summaryRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

// Inisialisasi
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('OK');
});

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/incomes', incomeRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/summary', summaryRoutes);
app.use('/api/admin', adminRoutes);

// Nyalakan server — selalu paling akhir
app.listen(PORT, () => {
  console.log(`Server jalan di port ${PORT}`);
});