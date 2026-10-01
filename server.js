// Import
require('dotenv').config();
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
});


const express = require('express');
const path = require('path');

const pool = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const incomeRoutes = require('./src/routes/incomeRoutes');
const expenseRoutes = require('./src/routes/expenseRoutes');
const summaryRoutes = require('./src/routes/summaryRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const pinoHttp = require('pino-http');
const { randomUUID } = require('crypto');
const logger = require('./src/utils/logger');
const { recordRequest, getMetrics } = require('./src/utils/metrics');

// Inisialisasi
const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  pinoHttp({
    logger,
    genReqId: (req, res) => {
      const id = req.headers['x-request-id'] || randomUUID();
      res.setHeader('X-Request-Id', id);
      return id;
    },
  })
);

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    recordRequest(duration, res.statusCode);
  });
  next();
});

// Routes
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

app.get('/metrics', (req, res) => {
  res.json(getMetrics());
});

app.use('/api/auth', authRoutes);
app.use('/api/incomes', incomeRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/summary', summaryRoutes);
app.use('/api/admin', adminRoutes);

// Nyalakan server
Sentry.setupExpressErrorHandler(app);

// Nyalakan server — hanya saat dijalankan lokal, bukan di Vercel
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    logger.info(`Server jalan di port ${PORT}`);
  });
}

module.exports = app;
