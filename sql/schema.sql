-- Skema database Budget Management System
-- Jalankan file ini urut dari atas ke bawah di PostgreSQL (lokal maupun production)

-- ============================
-- Tabel: users
-- ============================
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'customer');

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Menjamin owner hanya boleh ada satu di seluruh sistem
CREATE UNIQUE INDEX only_one_owner ON users (role) WHERE role = 'owner';

-- ============================
-- Tabel: incomes
-- ============================
CREATE TABLE incomes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source VARCHAR(255) NOT NULL,
  description TEXT,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  occurred_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_incomes_user_id ON incomes(user_id);

-- ============================
-- Tabel: expenses
-- ============================
CREATE TABLE expenses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item VARCHAR(255) NOT NULL,
  description TEXT,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  occurred_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_expenses_user_id ON expenses(user_id);

-- ============================
-- Tabel: activity_logs
-- ============================
CREATE TABLE activity_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity VARCHAR(100),
  entity_id INTEGER,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);