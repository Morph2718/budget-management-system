// Import
const express = require('express');
require('dotenv').config(); // baca isi file .env

// Inisialisasi
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware & route dasar
app.use(express.json()); // biar server bisa baca body JSON dari request

const authRoutes = require('./src/routes/authRoutes');
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('OK');
});

// Nyalakan server
app.listen(PORT, () => {
  console.log(`Server jalan di port ${PORT}`);
});

// Cek koneksi database
const pool = require('./src/config/db');

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

// Routes untuk income dan expense
const incomeRoutes = require('./src/routes/incomeRoutes');
app.use('/api/incomes', incomeRoutes);

const expenseRoutes = require('./src/routes/expenseRoutes');
app.use('/api/expenses', expenseRoutes);