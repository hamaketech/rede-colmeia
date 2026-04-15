ALTER TABLE partners ADD COLUMN status TEXT NOT NULL DEFAULT 'active';

CREATE INDEX IF NOT EXISTS idx_partners_status ON partners(status);
