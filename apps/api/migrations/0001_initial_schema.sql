CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'user',
  created_at DATETIME,
  updated_at DATETIME
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT,
  started_at DATETIME,
  canceled_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  subscription_id TEXT,
  amount INTEGER NOT NULL,
  status TEXT,
  provider TEXT,
  created_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
);

CREATE TABLE IF NOT EXISTS partners (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT,
  contact_info TEXT,
  capacity INTEGER,
  created_at DATETIME
);

CREATE TABLE IF NOT EXISTS beneficiaries (
  id TEXT PRIMARY KEY,
  name TEXT,
  document_id TEXT,
  region TEXT,
  household_size INTEGER,
  status TEXT,
  created_at DATETIME
);

CREATE TABLE IF NOT EXISTS distributions (
  id TEXT PRIMARY KEY,
  partner_id TEXT,
  total_baskets INTEGER,
  status TEXT,
  created_at DATETIME,
  FOREIGN KEY (partner_id) REFERENCES partners(id)
);

CREATE TABLE IF NOT EXISTS distribution_items (
  id TEXT PRIMARY KEY,
  distribution_id TEXT,
  beneficiary_id TEXT,
  status TEXT,
  FOREIGN KEY (distribution_id) REFERENCES distributions(id),
  FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries(id)
);

CREATE TABLE IF NOT EXISTS receipts (
  id TEXT PRIMARY KEY,
  distribution_item_id TEXT,
  confirmed_by TEXT,
  notes TEXT,
  created_at DATETIME,
  FOREIGN KEY (distribution_item_id) REFERENCES distribution_items(id)
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_partners_region ON partners(region);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_region ON beneficiaries(region);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_status ON beneficiaries(status);
CREATE INDEX IF NOT EXISTS idx_distributions_partner ON distributions(partner_id);
CREATE INDEX IF NOT EXISTS idx_distribution_items_distribution ON distribution_items(distribution_id);
CREATE INDEX IF NOT EXISTS idx_distribution_items_beneficiary ON distribution_items(beneficiary_id);
