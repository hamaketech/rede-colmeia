CREATE TABLE IF NOT EXISTS auth_reset_throttles (
  email TEXT PRIMARY KEY,
  last_requested_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_auth_reset_throttles_last_requested
  ON auth_reset_throttles(last_requested_at);
