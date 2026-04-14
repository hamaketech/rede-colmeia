-- `subscriptions` and `transactions` are defined in 0001_initial_schema.sql.
-- Phase 4 reuses that canonical schema and adds only operational snapshot support.
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

CREATE TABLE IF NOT EXISTS ops_indicator_snapshots (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  queued_requests INTEGER NOT NULL DEFAULT 0,
  preparing_baskets INTEGER NOT NULL DEFAULT 0,
  in_delivery INTEGER NOT NULL DEFAULT 0,
  delivered INTEGER NOT NULL DEFAULT 0,
  average_response_hours INTEGER NOT NULL DEFAULT 24,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO ops_indicator_snapshots (
  id,
  queued_requests,
  preparing_baskets,
  in_delivery,
  delivered,
  average_response_hours
) VALUES (1, 12, 8, 4, 25, 18);
